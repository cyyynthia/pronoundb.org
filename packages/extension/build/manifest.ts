/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import type { Plugin } from 'vite'

type Manifest = Omit<chrome.runtime.ManifestV3, 'background'> // Firefox background page compat
  & Pick<chrome.runtime.ManifestV2 | chrome.runtime.ManifestV3, 'background'>

export default function manifest (): Plugin {
  let isDev = false
  let ver = '0.0.0'

  return {
    name: 'pdb-ext-manifest',
    configResolved: (cfg) => void (isDev = !!cfg.build.watch),
    buildStart: function () {
      if (!process.env.PDB_BROWSER_TARGET) {
        this.warn('Missing PDB_BROWSER_TARGET environment variable. Defaulting to Chrome.')
        process.env.PDB_BROWSER_TARGET = 'chrome'
      }

      if (!process.env.PDB_EXT_VERSION) {
        if (!isDev) this.error('Missing PDB_EXT_VERSION environment variable. Aborting production build.')
        this.warn('Missing PDB_EXT_VERSION environment variable. Defaulting to 0.0.0.')
      }

      ver = process.env.PDB_EXT_VERSION || ver
    },

    generateBundle: function (_cfg, bundle) {
      const chunks: Record<string, { name: string, imports: string[] }> = Object.fromEntries(
        Object.entries(bundle).map(
          ([ f, b ]) => [ b.name, { name: f, imports: 'imports' in b ? b.imports : [] } ]
        )
      )

      const manifestData: Manifest = {
        manifest_version: 3,
        name: isDev ? 'PronounDB (dev)' : 'PronounDB',
        description: 'A browser extension that lets people know how to refer to each other on various places of the Internet', // todo: localize?
        version: ver,

        permissions: [ 'activeTab', 'storage' ],
        // todo: localhost api indev
        host_permissions: [ 'https://*.pronoundb.org/*' ],
        action: { default_popup: 'popup.html' },
        content_security_policy: {
          // todo: localhost api indev
          extension_pages: 'default-src \'self\'; connect-src https://pronoundb.org;',
        },

        background: process.env.PDB_BROWSER_TARGET === 'firefox'
          ? { page: 'background.html' }
          : { service_worker: chunks.worker.name, type: 'module' },

        content_scripts: [
          { js: [ chunks.wrapper.name ], matches: [ '<all_urls>' ] },
        ],

        web_accessible_resources: process.env.PDB_BROWSER_TARGET !== 'firefox'
          ? [ { resources: [ chunks.extension.name, ...chunks.extension.imports ], matches: [ '*://*/*' ] } ]
          : void 0,

        browser_specific_settings: process.env.PDB_BROWSER_TARGET === 'firefox'
          ? { gecko: { id: 'firefox-addon@pronoundb.org' } }
          : void 0,
      }

      // Manifest v2 compatibility for Firefox
      // todo: remove once MV3 reaches GA in FF
      if (process.env.PDB_BROWSER_TARGET === 'firefox') {
        manifestData.manifest_version = 2
        manifestData.browser_action = manifestData.action
        manifestData.permissions.push(...manifestData.host_permissions)

        delete manifestData.action
        delete manifestData.content_security_policy
        delete manifestData.host_permissions
      }

      this.emitFile({
        type: 'asset',
        name: 'manifest.json',
        fileName: 'manifest.json',
        source: JSON.stringify(manifestData),
      })
    },
  }
}

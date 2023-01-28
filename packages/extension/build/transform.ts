/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
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

export default function transform (): Plugin {
  let isDev = false
  return {
    name: 'pdb-ext-transform-code',
    configResolved: (cfg) => void (isDev = !!cfg.build.watch),

    // Remove references to innerHTML
    transform: (code) =>
      !isDev && code.includes('dangerouslySetInnerHTML')
        ? code.replace(/;[^;]+innerHTML.*?}/, '}')
        : void 0,

    // Replace references to __BUILD_CHUNK__ to actual assets
    generateBundle: (_cfg, bundle) => {
      const chunks = Object.values(bundle).filter((c) => c.type === 'chunk')
      for (const file in bundle) {
        if (file in bundle) {
          const chunk = bundle[file]
          if (chunk.type === 'chunk') {
            chunk.code = chunk.code.replace(
              /window\.__BUILD_CHUNK__\.([a-z]+)/g,
              (_, chk) => JSON.stringify(chunks.find((c) => c.name === chk)?.fileName)
            )
          }
        }
      }
    },
  }
}

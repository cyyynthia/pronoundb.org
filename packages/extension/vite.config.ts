/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
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

import { join } from 'path'
import { readFile, rmdir, rename } from 'fs/promises'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import magicalSvg from 'vite-plugin-magical-svg'

function finalizeBuild (): Plugin {
  let isDev = false
  return {
    name: 'finalize-build',
    configResolved: (cfg) => void (isDev = Boolean(cfg.build.watch)),
    generateBundle: async function (_, bundle) {
      const out = Object.entries(bundle)
      let manifest = await readFile(join(__dirname, 'manifest.template.json'), 'utf8')
      for (const file of out) {
        if (file[1].name === 'extension') {
          const names = [ file[0], ...(file[1] as any).imports ].join('", "')
          manifest = manifest.replace(`@chunk:${file[1].name}`, names)
          continue
        }

        manifest = manifest.replace(`@chunk:${file[1].name}`, file[0])
      }
      if (isDev) {
        manifest = manifest
          .replace('PronounDB', 'PronounDB (dev)')
          .replace('https://pronoundb.org', 'http://pronoundb.localhost:8080')
      }

      this.emitFile({ type: 'asset', fileName: 'manifest.json', source: manifest })
    },
    closeBundle: async () => {
      // Move html files
      const src = join(__dirname, 'dist', 'src')

      const popup = join(src, 'popup', 'index.html')
      const popupOut = join(__dirname, 'dist', 'popup.html')
      const background = join(src, 'background.html')
      const backgroundOut = join(__dirname, 'dist', 'background.html')

      await rename(popup, popupOut)
      await rename(background, backgroundOut)
      await rmdir(join(src, 'popup'))
      await rmdir(src)
    },
  }
}

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
    outDir: 'dist',
    target: 'es6',
    rollupOptions: {
      input: {
        wrapper: join(__dirname, 'src', 'wrapper.ts'),
        extension: join(__dirname, 'src', 'index.ts'),
        background: join(__dirname, 'src', 'background.html'),
        popup: join(__dirname, 'src', 'popup', 'index.html'),
      },
    },
  },
  plugins: [
    preact(),
    finalizeBuild(),
    magicalSvg({ target: 'preact' }),
  ],
})

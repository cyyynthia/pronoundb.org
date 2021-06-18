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

import type { Plugin, ESBuildOptions } from 'vite'

import { join } from 'path'
import { readFile, rmdir, rename } from 'fs/promises'
import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

function noJsxInject (): Plugin {
  return {
    name: 'no-jsx-inject',
    config: (c) => void ((c.esbuild as ESBuildOptions).jsxInject = ''),
  }
}

function finalizeBuild (): Plugin {
  return {
    name: 'finalize-build',
    generateBundle: async function (_, bundle) {
      // "http://pronoundb.localhost:8080/api/v1/*"
      const out = Object.entries(bundle)
      let manifest = await readFile(join(__dirname, 'manifest.template.json'), 'utf8')
      for (const file of out) manifest = manifest.replace(`@chunk:${file[1].name}`, file[0])

      this.emitFile({ type: 'asset', fileName: 'manifest.json', source: manifest })
    },
    closeBundle: async () => {
      // Move index.html
      const src = join(__dirname, 'dist', 'src')
      const popup = join(src, 'popup')
      const index = join(popup, 'index.html')
      const out = join(__dirname, 'dist', 'popup.html')

      await rename(index, out)
      await rmdir(popup)
      await rmdir(src)
    },
  }
}

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
    outDir: 'dist',
    rollupOptions: {
      input: {
        extension: join(__dirname, 'src', 'index.ts'),
        background: join(__dirname, 'src', 'background.ts'),
        popup: join(__dirname, 'src', 'popup', 'index.html'),
      },
    },
  },
  plugins: [
    preact(),
    noJsxInject(),
    finalizeBuild(),
    // magicalSvg({ target: 'preact' }),
  ],
})

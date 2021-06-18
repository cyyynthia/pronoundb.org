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

import { existsSync, createWriteStream } from 'fs'
import { mkdir, readFile } from 'fs/promises'
import archiver from 'archiver'
import { readdirRecursive } from './readdir.mjs'

const DIST_PATH = new URL('../dist/', import.meta.url)
const SRC_PATH = new URL('../../../', import.meta.url)
const PACKED_DIST = new URL('../packed/', import.meta.url)
const CHROME_DIST = new URL('chrome.zip', PACKED_DIST)
const FIREFOX_DIST = new URL('firefox.zip', PACKED_DIST)
const SOURCE_DIST = new URL('source.zip', PACKED_DIST)

const FF_MANIFEST = '"browser_specific_settings": { "gecko": { "id": "firefox-addon@pronoundb.org" } }'

if (!existsSync(PACKED_DIST)) {
  await mkdir(PACKED_DIST)
}

const chromeArchive = archiver('zip', { zlib: { level: 9 } })
const firefoxArchive = archiver('zip', { zlib: { level: 9 } })
const sourceArchive = archiver('zip', { zlib: { level: 9 } })
chromeArchive.pipe(createWriteStream(CHROME_DIST))
firefoxArchive.pipe(createWriteStream(FIREFOX_DIST))
sourceArchive.pipe(createWriteStream(SOURCE_DIST))

// Bundle the extension
for await (const file of readdirRecursive(DIST_PATH)) {
  chromeArchive.file(file.path, { name: file.name })
  if (file.name === 'manifest.json') {
    const manifest = await readFile(file.path, 'utf8')
    firefoxArchive.append(manifest.replace('{', `{\n  ${FF_MANIFEST},`), { name: file.name })
    continue
  }

  firefoxArchive.file(file.path, { name: file.name })
}

// Make an archive of the source code
sourceArchive.file(new URL('Mozilla-Addons-Note.md', import.meta.url).pathname, { name: 'README.md' })
sourceArchive.file(new URL('pnpm-lock.yaml', SRC_PATH).pathname, { name: 'pnpm-lock.yaml' })
sourceArchive.file(new URL('pnpm-workspace.yaml', SRC_PATH).pathname, { name: 'pnpm-workspace.yaml' })
sourceArchive.file(new URL('tsconfig.json', SRC_PATH).pathname, { name: 'tsconfig.json' })
sourceArchive.file(new URL('.eslintrc.json', SRC_PATH).pathname, { name: '.eslintrc.json' })

// -> Only shared and extension packages are required
for (const pkg of [ 'shared', 'extension' ]) {
  for await (const file of readdirRecursive(new URL(`packages/${pkg}/`, SRC_PATH))) {
    console.log(`packages/${pkg}/${file.name}`)
    sourceArchive.file(file.path, { name: `packages/${pkg}/${file.name}` })
  }
}

await Promise.all([ sourceArchive.finalize(), chromeArchive.finalize(), firefoxArchive.finalize() ])

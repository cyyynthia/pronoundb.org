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

const { join, basename, relative } = require('path')
const { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync, rmdirSync, createReadStream, createWriteStream } = require('fs')
const archiver = require('archiver')

const manifest = require('./manifest.json')
const { version } = require('../package.json')

function readdirRecursive (path) {
  const files = []
  const folders = []

  for (const file of readdirSync(path)) {
    const full = join(path, file)
    if (statSync(full).isDirectory()) {
      const sub = readdirRecursive(full)
      files.push(...sub.files)
      folders.push(full, ...sub.folders)
    } else {
      files.push(full)
    }
  }

  return {
    files: files,
    folders: folders,
  }
}

function mkdirOverwrite (path) {
  if (existsSync(path)) {
    const { files, folders } = readdirRecursive(path)
    for (const file of files) {
      unlinkSync(file)
    }

    for (const folder of folders) {
      rmdirSync(folder)
    }
  } else {
    mkdirSync(path)
  }
}

manifest.version = version
const manifestFirefox = {
  ...manifest,
  browser_specific_settings: {
    gecko: {
      id: 'firefox-addon@pronoundb.org'
    }
  }
}

const rootFolder = join(__dirname, '..')
const production = process.argv.includes('--pack')
const extensionDistPath = join(rootFolder, 'dist', 'extension')
const extensionCodePath = join(rootFolder, 'extension')
const files = [
  join(extensionDistPath, 'background.js'),
  join(extensionDistPath, 'pronoundb.js'),
  join(extensionDistPath, 'popup.js'),
  join(extensionCodePath, 'popup.css'),
  join(extensionCodePath, 'popup.html'),

  production && join(extensionDistPath, 'background.js.map'),
  production && join(extensionDistPath, 'pronoundb.js.map'),
  production && join(extensionDistPath, 'popup.js.map')
].filter(Boolean)

if (production) {
  const dest = join(rootFolder, 'dist', 'extension', 'packed')
  const extDest = join(dest, 'pronoundb.zip')
  const extFirefoxDest = join(dest, 'pronoundb.firefox.zip')
  const extSourceDest = join(dest, 'pronoundb.source.zip')

  mkdirOverwrite(dest)
  const zipExt = archiver('zip', { zlib: { level: 9 } })
  const zipExtFirefox = archiver('zip', { zlib: { level: 9 } })
  const zipExtSource = archiver('zip', { zlib: { level: 9 } })
  const sourceFiles = [
    join(rootFolder, 'package.json'),
    join(rootFolder, 'pnpm-lock.yaml'),
    ...readdirRecursive(join(rootFolder, 'build')).files,
    ...readdirRecursive(join(rootFolder, 'extension')).files,
  ]

  zipExt.pipe(createWriteStream(extDest))
  zipExtFirefox.pipe(createWriteStream(extFirefoxDest))
  zipExtSource.pipe(createWriteStream(extSourceDest))

  zipExt.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' })
  zipExtFirefox.append(JSON.stringify(manifestFirefox, null, 2), { name: 'manifest.json' })

  for (const file of files) {
    zipExt.append(createReadStream(file), { name: basename(file) })
    zipExtFirefox.append(createReadStream(file), { name: basename(file) })
  }

  zipExtSource.append(readFileSync(join(__dirname, 'Mozilla-Addons-Note.md')), { name: 'README.md' })
  for (const file of sourceFiles) {
    zipExtSource.append(readFileSync(file), { name: relative(rootFolder, file) })
  }

  zipExt.finalize()
  zipExtFirefox.finalize()
  zipExtSource.finalize()
} else {
  const usedManifest = process.argv.includes('--firefox') ? manifestFirefox : manifest
  usedManifest.name += ' (dev)'
  usedManifest.permissions.push('http://localhost:8080/api/v1/*')

  const dest = join(__dirname, '..', 'dist', 'extension', 'unpacked')
  mkdirOverwrite(dest)

  for (const file of files) {
    writeFileSync(
      join(dest, basename(file)),
      readFileSync(file, 'utf8')
    )
  }

  writeFileSync(join(dest, 'manifest.json'), JSON.stringify(usedManifest, null, 2))
}

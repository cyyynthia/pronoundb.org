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

const { createHash } = require('crypto')
const { readFileSync } = require('fs')
const { rename } = require('fs/promises')
const { join } = require('path')

let finalLicensePath = ''
const baseLicensePath = join('dist', 'assets', 'third-party-licenses.txt')

function renderLicense (deps) {
  let str = 'Licenses for open-source software used in this website are reproduced below.\n=========================\n\n'
  for (const dep of deps) {
    const home = dep.homepage || dep.repository.url || dep.repository
    str += `${dep.name}${home ? ` (${home})` : ''}\nThis software is licensed under the following terms:\n\n${dep.licenseText.trim()}\n\n----------\n\n`
  }

  // Tailwindcss
  const twLicense = readFileSync(join(__dirname, '..', 'node_modules', 'tailwindcss', 'LICENSE'), 'utf8')
  str += `tailwindcss (https://tailwindcss.com)\nThis software is licensed under the following terms:\n\n${twLicense.trim()}\n\n----------\n\n`

  // Quicksand
  const qsLicense = readFileSync(join(__dirname, '..', 'fonts', 'quicksand-license.txt'), 'utf8')
  str += `Quicksand Font Family (https://github.com/andrew-paglinawan/QuicksandFamily)\nThis software is licensed under the following terms:\n\n${qsLicense.trim()}\n\n----------\n\n`

  // Create hash
  str += 'Meow~'
  const hash = createHash('sha256').update(str).digest('hex').slice(0, 8)
  finalLicensePath = join('assets', `third-party-licenses.${hash}.txt`)

  return str
}

// rollup-plugin-license doesn't do a great job w/ Vite :<
function finishLicense ({ workingDirectory }) {
  let skip = false
  return {
    name: 'finish-license',
    configResolved: (cfg) => {
      skip = !cfg.isProduction
    },
    generateBundle: (_, bundle) => {
      if (process.argv.includes('--ssr')) return
      const header = [
        'Copyright (c) Cynthia K. Rey, All Rights Reserved.',
        'Licensed under the BSD-3-Clause license. Contains third-party software licensed under different terms.',
        `For third-party software licenses included in this build, please see /${finalLicensePath}`,
      ]

      for (const item of Object.values(bundle)) {
        if (item.type === 'chunk') {
          item.code = `/*!\n * ${header.join('\n * ')}\n */\n${item.code}`
          continue
        }

        if (item.fileName.endsWith('.svg')) {
          item.source = `<!--\n  ${header.join('\n  ')}\n-->\n${item.source}`
          continue
        }

        if (item.fileName.endsWith('.css')) {
          item.source = `/*!\n * ${header.join('\n * ')}\n */\n${item.source}`
          continue
        }
      }
    },
    closeBundle: async () => {
      if (!skip && !process.argv.includes('--ssr')) {
        await rename(baseLicensePath, join(workingDirectory, 'dist', finalLicensePath)).catch(() => void 0)
      }
    },
  }
}

module.exports = {
  baseLicensePath: baseLicensePath,
  renderLicense: renderLicense,
  finishLicense: finishLicense,
}

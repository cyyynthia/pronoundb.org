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

import type { Dependency } from 'rollup-plugin-license'
import type { Plugin } from 'vite'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import { rename } from 'fs/promises'
import { join } from 'path'

let finalLicensePath = ''
export let baseLicensePath = join('assets', 'third-party-licenses.txt')

const LICENSE = join(import.meta.dirname, '..', '..', '..', 'LICENSE')

const TP_LICENSES = [
	{
		target: 'js-lru (https://github.com/rsms/js-lru)',
		license: join(import.meta.dirname, '..', 'src', 'utils', 'lru', 'LICENSE'),
	},
	{
		target: 'tailwindcss (https://tailwindcss.com)',
		license: join(import.meta.dirname, '..', 'node_modules', 'tailwindcss', 'LICENSE'),
	},
	{
		target: 'Quicksand Font Family (https://github.com/andrew-paglinawan/QuicksandFamily)',
		license: join(import.meta.dirname, '..', 'assets', 'fonts', 'quicksand-license.txt'),
	},
]

export function renderLicense (deps: Dependency[]) {
	let str = readFileSync(LICENSE, 'utf8').trim() + '\n\n'
	str += '======================================================================================================\n'
	str += 'This software includes third-party components licensed under different terms.\n'
	str += 'Below is a list of third-party components included in the software and their respective license terms.\n'
	str += '======================================================================================================\n\n'

	for (const dep of deps) {
		if (!dep.licenseText) throw new Error(`No license text found for ${dep.name}.`)

		const home = dep.homepage || (typeof dep.repository === 'string' ? dep.repository : dep.repository?.url)
		str += `${dep.name}${home ? ` (${home})` : ''}\nThis software is licensed under the following terms:\n\n${dep.licenseText.trim()}\n\n----------\n\n`
	}

	for (const license of TP_LICENSES) {
		const licenseText = readFileSync(license.license, 'utf8')
		str += `${license.target}\nThis software is licensed under the following terms:\n\n${licenseText.trim()}\n\n----------\n\n`
	}

	// Create hash
	str += 'Meow~\n'
	const hash = createHash('sha256').update(str).digest('hex').slice(0, 8)
	finalLicensePath = join('assets', `license.${hash}.txt`)

	return str
}

export function finishLicense (): Plugin {
	let skip = false

	return {
		enforce: 'post',
		name: 'finish-license',
		configResolved: (cfg) => {
			skip = !cfg.isProduction
			baseLicensePath = join(cfg.build.outDir, baseLicensePath)
		},
		generateBundle: (_opts, bundle) => {
			if (skip) return

			const message = `Copyright (c) Cynthia Rey et al. - Please refer to /${finalLicensePath} for the applicable license terms`
			for (const item of Object.values(bundle)) {
				if (item.type === 'chunk') {
					item.code = `/*! ${message} */\n${item.code}`
					continue
				}

				if (item.fileName.endsWith('.svg')) {
					item.source = `<!-- ${message} -->\n${item.source}`
					continue
				}

				if (item.fileName.endsWith('.css')) {
					item.source = `/*! ${message} */\n${item.source}`
					continue
				}
			}
		},
		writeBundle: (opts) => {
			return rename(baseLicensePath, join(opts.dir!, finalLicensePath))
		},
	}
}

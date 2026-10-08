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
import { join, relative } from 'path'
import { createWriteStream } from 'fs'
import { readdir, stat } from 'fs/promises'
import { ZipArchive } from 'archiver'

type File = { name: string, path: string }

async function* readdirRecursive (path: string, base = path): AsyncGenerator<File> {
	const files = await readdir(path)
	for (const file of files) {
		const filepath = join(path, file)
		const info = await stat(filepath)
		if (info.isDirectory()) {
			if (file === 'node_modules' || file === 'dist' || file === 'packed') continue
			yield* readdirRecursive(join(path, file), base)
		} else {
			yield { name: relative(base, filepath), path: filepath }
		}
	}
}

export default function pack (): Plugin {
	let skip = false

	return {
		enforce: 'post',
		name: 'pdb-ext-pack',
		configResolved: (cfg) => void (skip = !cfg.isProduction),
		writeBundle: async (opts) => {
			if (skip) return

			const archive = new ZipArchive({ zlib: { level: 9 } })
			archive.pipe(createWriteStream(`${opts.dir}.zip`))

			for await (const file of readdirRecursive(opts.dir!)) archive.file(file.path, { name: file.name })
			await archive.finalize()

			if (process.env.PDB_BROWSER_TARGET === 'firefox') {
				// Prepare a source file archive, required by MAO review policies
				const srcArchive = new ZipArchive({ zlib: { level: 9 } })
				srcArchive.pipe(createWriteStream(join(opts.dir!, '..', 'source.zip')))

				// Add individual base source files
				const baseDir = join(import.meta.dirname, '..')
				const rootDir = join(baseDir, '..', '..')
				srcArchive.file(join(baseDir, 'Mozilla-Addons-Note.md'), { name: 'README.md' })
				srcArchive.file(join(rootDir, 'pnpm-lock.yaml'), { name: 'pnpm-lock.yaml' })
				srcArchive.file(join(rootDir, 'pnpm-workspace.yaml'), { name: 'pnpm-workspace.yaml' })
				srcArchive.file(join(rootDir, 'tsconfig.json'), { name: 'tsconfig.json' })
				srcArchive.file(join(rootDir, '.eslintrc.json'), { name: '.eslintrc.json' })

				// Add necessary packages
				for (const pkg of [ 'extension', 'pronouns' ]) {
					for await (const file of readdirRecursive(join(rootDir, 'packages', pkg))) {
						srcArchive.file(file.path, { name: `packages/${pkg}/${file.name}` })
					}
				}

				await srcArchive.finalize()
			}
		},
	}
}

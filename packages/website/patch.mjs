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

// This script patches the built Astro server to mitigate performance issues observed while profiling PronounDB.
// The detailed investigation can be found here: https://twitter.com/cyyynthia_/status/1782152295821492402
//
// This patches does the following:
// - Disables static assets handling (handled by nginx)
// - Turns most significant dynamic imports static

import { readFileSync, writeFileSync } from 'fs'

const ASTRO_SERVER = new URL('./dist/server/', import.meta.url)
const ENTRY_FILE = new URL('./entry.mjs', ASTRO_SERVER)

// Process entrypoint
let entry = readFileSync(ENTRY_FILE, 'utf8')
entry = entry
	.replace(/var (_page\d+) = \(\) => import\(("[^"]+")\);/g, 'import * as _$1 from $2; var $1 = () => _$1; // [Cynthia\'s patch]')
	.replace('staticHandler(req, res, () => appHandler(req, res))', '/* [Cynthia\'s patch] */ appHandler(req, res)')

writeFileSync(ENTRY_FILE, entry)

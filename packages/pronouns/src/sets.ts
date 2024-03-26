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

import * as enSets from './sets/en.js'
import * as nbSets from './sets/nb.js'
import * as nnSets from './sets/nn.js'

export type Sets = [ string ] | [ string, string ] | [ string, string, string ]

export type UserData = {
	decoration: string | null
	sets: { [locale: string]: Sets }
}

type SetDefinitionInner<T = string | readonly string[]> = {
	readonly standard: T
	readonly capitalized?: T
}

export type SetDefinition = {
	readonly sets: {
		readonly [set: string]: {
			readonly classic: SetDefinitionInner
			readonly short?: SetDefinitionInner
		}
	}
	readonly categories: {
		readonly nominative: readonly string[]
		readonly meta: readonly string[]
	}
	readonly properties: {
		readonly unique: readonly string[]
		readonly final: readonly string[]
	}

	readonly formatLong: (sets: Sets) => string
}

export const PronounSets: Record<string, SetDefinition> = {
	en: enSets,
	nb: nbSets,
	nn: nnSets,
}

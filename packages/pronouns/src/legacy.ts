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

import type { Sets } from './sets.js'

export const LegacyPronouns: Record<string, string | string[]> = {
	// -- Contributors: please keep the list sorted alphabetically.
	hh: [ 'he/him', 'He/Him' ],
	hi: [ 'he/it', 'He/It' ],
	hs: [ 'he/she', 'He/She' ],
	ht: [ 'he/they', 'He/They' ],
	ih: [ 'it/him', 'It/Him' ],
	ii: [ 'it/its', 'It/Its' ],
	is: [ 'it/she', 'It/She' ],
	it: [ 'it/they', 'It/They' ],
	shh: [ 'she/he', 'She/He' ],
	sh: [ 'she/her', 'She/Her' ],
	si: [ 'she/it', 'She/It' ],
	st: [ 'she/they', 'She/They' ],
	th: [ 'they/he', 'They/He' ],
	ti: [ 'they/it', 'They/It' ],
	ts: [ 'they/she', 'They/She' ],
	tt: [ 'they/them', 'They/Them' ],
	// --
	any: 'Any pronouns',
	other: 'Other pronouns',
	ask: 'Ask me my pronouns',
	avoid: 'Avoid pronouns, use my name',
}


export function transformSetsToIdentifier (sets: Sets | null | undefined) {
	if (!sets || !sets[0]) {
		return 'unspecified'
	}

	// "Meta" sets
	if (sets[0] === 'avoid') {
		// Avoid can only be set as the 1st set
		return 'avoid'
	}

	if (sets.includes('any')) {
		// v2 supports things like "she/any"
		// in that case, we pick the "any" part
		return 'any'
	}

	if (sets.includes('ask')) {
		// v2 supports things like "she/ask"
		// in that case, we pick the "ask" part
		return 'ask'
	}

	// Sets included in v1
	if (sets[0] === 'he') {
		if (sets[1] === 'it') {
			return 'hi'
		}

		if (sets[1] === 'she') {
			return 'hs'
		}

		if (sets[1] === 'they') {
			return 'ht'
		}

		return 'hh'
	}

	if (sets[0] === 'it') {
		if (sets[1] === 'he') {
			return 'ih'
		}

		if (sets[1] === 'she') {
			return 'is'
		}

		if (sets[1] === 'they') {
			return 'it'
		}

		return 'ii'
	}

	if (sets[0] === 'she') {
		if (sets[1] === 'he') {
			return 'shh'
		}

		if (sets[1] === 'it') {
			return 'si'
		}

		if (sets[1] === 'they') {
			return 'st'
		}

		return 'sh'
	}

	if (sets[0] === 'they') {
		if (sets[1] === 'he') {
			return 'th'
		}

		if (sets[1] === 'it') {
			return 'ti'
		}

		if (sets[1] === 'she') {
			return 'ts'
		}

		return 'tt'
	}

	// Otherwise, we return "other" as v1 does not support newer ones
	return 'other'
}

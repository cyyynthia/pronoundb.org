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

import type { Sets } from '../sets.js'
import { formatPronounSetShort } from '../formatter.js'

//!\\ CONTRIBUTORS, KEEP PRONOUNS SORTED PER CATEGORY AND ALPHABETICALLY //!\\

export const sets = <const> {
	// Nominative
	de: {
		classic: {
			standard: [ 'de', 'dem' ],
			capitalized: [ 'De', 'Dem' ],
		},
	},
	det: {
		classic: {
			standard: [ 'det', 'det' ],
			capitalized: [ 'Det', 'Det' ],
		},
	},
	han: {
		classic: {
			standard: [ 'han', 'ham' ],
			capitalized: [ 'Han', 'Ham' ],
		},
	},
	hen: {
		classic: {
			standard: [ 'hen', 'hen' ],
			capitalized: [ 'Hen', 'Hen' ],
		},
	},
	hun: {
		classic: {
			standard: [ 'hun', 'henne' ],
			capitalized: [ 'Hun', 'Henne' ],
		},
	},

	// Meta
	alle: {
		classic: {
			standard: 'Alle pronomen',
		},
		short: {
			standard: 'alle',
			capitalized: 'Alle',
		},
	},
	andre: {
		classic: {
			standard: 'Andre pronomen',
		},
		short: {
			standard: 'andre',
			capitalized: 'Andre',
		},
	},
	spør: {
		classic: {
			standard: 'Spør meg om pronomena mine',
		},
		short: {
			standard: 'spør',
			capitalized: 'Spør',
		},
	},
	unngå: {
		classic: {
			standard: 'Unngå pronomen, bruk navnet mitt',
		},
		short: {
			standard: 'unngå',
			capitalized: 'Unngå',
		},
	},
}

export const categories = {
	nominative: [ 'de', 'det', 'han', 'hen', 'hun' ],
	meta: [ 'alle', 'spør', 'unngå', 'andre' ],
}

export const properties = {
	unique: ['unngå'],
	final: ['alle', 'spør', 'unngå', 'andre'],
}

export function formatLong (s: Sets) {
	if (s[0] === 'spør') {
		return 'Foretrekker å bli spurt om pronomena sine'
	}

	if (s[0] === 'unngå') {
		return 'Vil unngå pronomen'
	}

	if (s[0] === 'andre') {
		return 'Bruker pronomen som ikke er tilgjengelige på PronounDB'
	}

	let res = 'Bruker '
	for (let i = 0; i < s.length; i++) {
		const set = s[i]
		if (set === 'spør') {
			return `${res} pronomen. Du kan også spørre denne personen om mer informasjon`
		}

		if (set === 'andre') {
			return `${res} pronomen. Denne personen bruker også pronomen som ikke er tilgjengelige på PronounDB`
		}

		const pronouns = formatPronounSetShort(set, false, 'nn')

		if (i) {
			res += ', '
			if (i === s.length - 1) res += 'eller '
		}

		res += set === 'alle' ? pronouns : `"${pronouns}"`
	}

	return `${res} pronomen`
}

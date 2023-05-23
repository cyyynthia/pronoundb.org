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

//!\\ CONTRIBUTORS, KEEP PRONOUNS SORTED PER CATEGORY AND ALPHABETICALLY //!\\

export const sets = <const> {
	// Nominative
	he: {
		classic: {
			standard: [ 'he', 'him' ],
			capitalized: [ 'He', 'Him' ],
		},
	},
	it: {
		classic: {
			standard: [ 'it', 'its' ],
			capitalized: [ 'It', 'Its' ],
		},
	},
	she: {
		classic: {
			standard: [ 'she', 'her' ],
			capitalized: [ 'She', 'Her' ],
		},
	},
	they: {
		classic: {
			standard: [ 'they', 'them' ],
			capitalized: [ 'They', 'Them' ],
		},
	},

	// Meta
	any: {
		classic: {
			standard: 'any pronouns',
			capitalized: 'Any pronouns',
		},
		short: {
			standard: 'any',
			capitalized: 'Any',
		},
		split: {
			standard: [ 'any', 'pronouns' ],
			capitalized: [ 'Any', 'pronouns' ],
		},
	},
	ask: {
		classic: {
			standard: 'ask me my pronouns',
			capitalized: 'Ask me my pronouns',
		},
		short: {
			standard: 'ask',
			capitalized: 'Ask',
		},
		split: {
			standard: [ 'ask me', 'my pronouns' ],
			capitalized: [ 'Ask me', 'my pronouns' ],
		},
	},
	avoid: {
		classic: {
			standard: 'ask me my pronouns',
			capitalized: 'Ask me my pronouns',
		},
		short: {
			standard: 'ask',
			capitalized: 'Ask',
		},
		split: {
			standard: [ 'ask me', 'my pronouns' ],
			capitalized: [ 'Ask me', 'my pronouns' ],
		},
	},
	other: {
		classic: {
			standard: 'other pronouns',
			capitalized: 'Other pronouns',
		},
		short: {
			standard: 'other',
			capitalized: 'Other',
		},
		split: {
			standard: [ 'other', 'pronouns' ],
			capitalized: [ 'Other', 'pronouns' ],
		},
	},
}

export const categories = {
	nominative: [ 'he', 'it', 'she', 'they' ],
	meta: [ 'any', 'ask', 'avoid', 'other' ],
}

export const properties = {
	unique: [ 'avoid' ],
	final: [ 'any', 'ask', 'avoid', 'other' ],
}

export const defaultSplit = {
	idx: 0,
	array: [ '', 'pronouns' ],
}

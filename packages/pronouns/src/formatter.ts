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

// @ts-nocheck

import type { Sets } from './sets.js'
import { PronounSets } from './sets.js'

export function formatPronouns (sets: Sets, capitalize: boolean, locale: string) {
	if (sets.length === 1) return formatPronounSet(sets[0], capitalize, locale)

	const def = PronounSets[locale]
	if (!def) throw new Error(`Invalid locale '${locale}'`)

	const res = []
	for (const set of sets) {
		if (!(set in def.sets)) throw new Error(`Invalid set '${set}'`)
		const pronounDef = def.sets[set].short ?? def.sets[set].classic
		const pronouns = capitalize
			? pronounDef.capitalized
			: pronounDef.standard

		res.push(Array.isArray(pronouns) ? pronouns[0] : pronouns)
	}

	return res.join('/')
}

export function formatPronounsShort (sets: Sets, capitalize: boolean, locale: string) {
	if (sets.length === 1) return formatPronounSetShort(sets[0], capitalize, locale)

	const def = PronounSets[locale]
	if (!def) throw new Error(`Invalid locale '${locale}'`)

	const res = []
	for (const set of sets.slice(0, 2)) {
		if (!(set in def.sets)) throw new Error(`Invalid set '${set}'`)
		const pronounDef = def.sets[set].short ?? def.sets[set].classic
		const pronouns = capitalize
			? pronounDef.capitalized
			: pronounDef.standard

		res.push(Array.isArray(pronouns) ? pronouns[0] : pronouns)
	}

	return res.join('/')
}

export function formatPronounsLong (sets: Sets, locale: string) {
	const def = PronounSets[locale]
	if (!def) throw new Error(`Invalid locale '${locale}'`)

	return def.formatLong(sets)
}

export function formatPronounSet (set: string, capitalize: boolean, locale: string) {
	const def = PronounSets[locale]
	if (!def) throw new Error(`Invalid locale '${locale}'`)
	if (!(set in def.sets)) throw new Error(`Invalid set '${set}'`)

	const pronouns = capitalize
		? def.sets[set].classic.capitalized ?? def.sets[set].classic.standard
		: def.sets[set].classic.standard

	return Array.isArray(pronouns) ? pronouns.join('/') : pronouns as string
}

export function formatPronounSetShort (set: string, capitalize: boolean, locale: string) {
	const def = PronounSets[locale]
	if (!def) throw new Error(`Invalid locale '${locale}'`)
	if (!(set in def.sets)) throw new Error(`Invalid set '${set}'`)

	const pronounDef = def.sets[set].short ?? def.sets[set].classic
	const pronouns = capitalize
		? pronounDef.capitalized ?? pronounDef.standard
		: pronounDef.standard

	return Array.isArray(pronouns) ? pronouns.join('/') : pronouns as string
}

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

import type { APIContext } from 'astro'
import type { Sets } from '@pronoundb/pronouns/sets'
import { PronounSets } from '@pronoundb/pronouns/sets'
import { authenticate, validateCsrf } from '@server/auth.js'
import { updatePronouns, deletePronouns } from '@server/database/account.js'
import { setFlash } from '@server/flash.js'

export async function POST (ctx: APIContext) {
	const user = await authenticate(ctx)
	if (!user) return new Response('401: Unauthorized', { status: 401 })

	const body = await ctx.request.formData().catch(() => null)
	const csrfToken = body?.get('csrfToken')
	const locale = body?.get('locale')
	const set1 = body?.get('pronouns-set-1')
	const set2 = body?.get('pronouns-set-2')
	const set3 = body?.get('pronouns-set-3')

	if (typeof csrfToken !== 'string' || !validateCsrf(ctx, csrfToken)) {
		setFlash(ctx, 'E_CSRF')
		return ctx.redirect('/me')
	}

	if (typeof locale !== 'string' || typeof set1 !== 'string' || typeof set2 !== 'string' || typeof set3 !== 'string') {
		return new Response('400: Bad request', { status: 400 })
	}

	// Validate locale to be an existing one
	if (!(locale in PronounSets)) {
		setFlash(ctx, 'E_PRONOUNS_UNKNOWN_LOCALE')
		return ctx.redirect('/me')
	}

	const def = PronounSets[locale]!

	// Validate all sets to be valid sets for the target locale
	if (
		(set1 !== 'unspecified' && !(set1 in def.sets))
			|| (set2 !== 'unspecified' && !(set2 in def.sets))
			|| (set3 !== 'unspecified' && !(set3 in def.sets))
	) {
		setFlash(ctx, 'E_PRONOUNS_UNKNOWN_SET')
		return ctx.redirect('/me')
	}

	// Validate there are no duplicates
	if ((set1 !== 'unspecified' && (set1 === set2 || set1 === set3)) || (set2 !== 'unspecified' && set2 === set3)) {
		setFlash(ctx, 'E_PRONOUNS_DUPLICATE_ENTRIES')
		return ctx.redirect('/me')
	}

	// Validate no unique set is used as 2nd or 3rd
	if (def.properties.unique.includes(set2) || def.properties.unique.includes(set3)) {
		setFlash(ctx, 'E_PRONOUNS_INVALID_PLACEMENT')
		return ctx.redirect('/me')
	}

	// Validate there are no extra entries
	if ((set1 === 'unspecified' || def.properties.final.includes(set1)) && (set2 !== 'unspecified' || set3 !== 'unspecified')) {
		setFlash(ctx, 'E_PRONOUNS_EXTRA_SETS')
		return ctx.redirect('/me')
	}

	if ((set2 === 'unspecified' || def.properties.final.includes(set2)) && set3 !== 'unspecified') {
		setFlash(ctx, 'E_PRONOUNS_EXTRA_SETS')
		return ctx.redirect('/me')
	}

	// Sets are valid! we can now proceed.
	const sets: Sets = [] as any
	if (set1 !== 'unspecified') sets.push(set1)
	if (set2 !== 'unspecified') sets.push(set2)
	if (set3 !== 'unspecified') sets.push(set3)

	await (sets.length ? updatePronouns(user._id, sets, locale) : deletePronouns(user._id, locale))
	setFlash(ctx, 'S_PRONOUNS_UPDATED')
	return ctx.redirect('/me')
}

export function ALL () {
	return new Response('405: Method not allowed', { status: 405 })
}

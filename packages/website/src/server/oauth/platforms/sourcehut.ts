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

import type { ExternalAccount } from '@server/database/database.ts'
import type { FlashMessage } from '@server/flash.ts'

export const oauthVersion = 2
export const clientId = import.meta.env.OAUTH_SOURCEHUT_CLIENT
export const clientSecret = import.meta.env.OAUTH_SOURCEHUT_SECRET
export const oauthNoAuthorizationHeader = true

export const authorizationUrl = 'https://meta.sr.ht/oauth2/authorize'
export const tokenUrl = 'https://meta.sr.ht/oauth2/access-token'
export const scopes = [ 'meta.sr.ht/PROFILE:RO' ]

export async function getSelf (token: string): Promise<ExternalAccount | FlashMessage | null> {
	const res = await fetch('https://meta.sr.ht/query', {
		headers: {
			Authorization: `Bearer ${token}`,
			'User-Agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)',
			'Content-Type': 'application/json',
		},
		method: 'POST',
		body: JSON.stringify({
			query: `
				{
					me {
						username
						canonicalName
					}
				}
			`,
		}),
	})

	if (!res.ok) return null
	const { data: { me: { username, canonicalName } } } = await res.json()

	return {
		platform: 'sourcehut',
		accountId: username,
		accountName: canonicalName,
	}
}

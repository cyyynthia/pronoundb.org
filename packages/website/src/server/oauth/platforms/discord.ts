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

import type { ExternalAccount } from '../../database/account.js'
import type { FlashMessage } from '../../flash.js'

export const oauthVersion = 2
export const clientId = import.meta.env.OAUTH_DISCORD_CLIENT
export const clientSecret = import.meta.env.OAUTH_DISCORD_SECRET

export const authorizationUrl = 'https://discord.com/oauth2/authorize'
export const tokenUrl = 'https://discord.com/api/v10/oauth2/token'
export const scopes = [ 'identify' ]

function formatName (globalName: string, username: string, discriminator?: string) {
	const realUsername = !discriminator || discriminator === '0'
		? username
		: `${username}#${discriminator}`

	return globalName
		? `${globalName} (${realUsername})`
		: realUsername
}

export async function getSelf (token: string): Promise<ExternalAccount | FlashMessage | null> {
	const res = await fetch('https://discord.com/api/v10/users/@me', {
		headers: {
			authorization: `Bearer ${token}`,
			'user-agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)',
		},
	})

	if (!res.ok) return null
	const data = await res.json()

	return { id: data.id, name: formatName(data.global_name, data.username, data.discriminator), platform: 'discord' }
}

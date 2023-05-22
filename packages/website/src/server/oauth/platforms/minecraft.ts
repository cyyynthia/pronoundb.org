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
export const clientId = import.meta.env.OAUTH_MICROSOFT_CLIENT
export const clientSecret = import.meta.env.OAUTH_MICROSOFT_SECRET

export const authorizationUrl = 'https://login.live.com/oauth20_authorize.srf'
export const tokenUrl = 'https://login.live.com/oauth20_token.srf'
export const scopes = [ 'XboxLive.signin' ]

export async function getSelf (token: string): Promise<ExternalAccount | FlashMessage | null> {
	const headers = {
		accept: 'application/json',
		'content-type': 'application/json',
		'user-agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)',
	}

	// Begin Xbox Live Auth
	const xliveRes = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			Properties: {
				AuthMethod: 'RPS',
				SiteName: 'user.auth.xboxlive.com',
				RpsTicket: `d=${token}`,
			},
			RelyingParty: 'http://auth.xboxlive.com',
			TokenType: 'JWT',
		}),
	})

	if (!xliveRes.ok) {
		// Allow garbage collection
		await xliveRes.arrayBuffer()
		return 'E_XLIVE_AUTHENTICATION'
	}

	const xlive = await xliveRes.json()
	// End Xbox Live Auth

	// Begin Xbox XSTS Auth
	const xstsRes = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			Properties: {
				SandboxId: 'RETAIL',
				UserTokens: [ xlive.Token ],
			},
			RelyingParty: 'rp://api.minecraftservices.com/',
			TokenType: 'JWT',
		}),
	})

	if (!xstsRes.ok) {
		if (xstsRes.status === 401) {
			const error = await xstsRes.json()
			if (error.XErr === 2148916233) return 'E_XLIVE_NO_ACCOUNT'
			if (error.XErr === 2148916235) return 'E_XLIVE_UNAVAILABLE'
			if (error.XErr === 2148916238) return 'E_XLIVE_CHILD'
		} else {
			// Allow garbage collection
			await xstsRes.arrayBuffer()
		}

		return 'E_XLIVE_AUTHORIZATION'
	}

	const xsts = await xstsRes.json()
	// End Xbox XSTS Auth

	// Begin Minecraft Auth
	const minecraftRes = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
		method: 'POST',
		headers: headers,
		body: JSON.stringify({
			identityToken: `XBL3.0 x=${xlive.DisplayClaims.xui[0].uhs};${xsts.Token}`,
		}),
	})

	if (!minecraftRes.ok) {
		// Allow garbage collection
		await minecraftRes.arrayBuffer()
		return 'E_MC_AUTH'
	}

	const minecraftToken = await minecraftRes.json()
	// End Minecraft Auth

	/// AUTHENTICATION PIPELINE END

	// User data wooo
	const profileRes = await fetch('https://api.minecraftservices.com/minecraft/profile', {
		headers: {
			accept: 'application/json',
			authorization: `Bearer ${minecraftToken.access_token}`,
			'user-agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)',
		},
	})

	if (!profileRes.ok) {
		// Allow garbage collection
		await profileRes.arrayBuffer()
		return null
	}

	const data = await profileRes.json()
	if (!data.id) return 'E_MC_NO_LICENSE'

	const uuid = `${data.id.slice(0, 8)}-${data.id.slice(8, 12)}-${data.id.slice(12, 16)}-${data.id.slice(16, 20)}-${data.id.slice(20)}`
	return { id: uuid, name: data.name, platform: 'minecraft' }
}

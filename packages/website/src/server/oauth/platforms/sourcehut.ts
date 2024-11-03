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

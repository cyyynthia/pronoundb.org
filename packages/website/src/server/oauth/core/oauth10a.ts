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
import type { ExternalAccount } from '../../database/account.js'
import type { ParsedUrlQueryInput } from 'querystring'

import { randomUUID, createHmac } from 'crypto'
import { encode, decode } from 'querystring'
import { type FlashMessage, setFlash } from '../../flash.js'

export type OAuth1Params = {
  oauthVersion: 1
  clientId: string
  clientSecret: string

  requestUrl: string
  authorizationUrl: string
  tokenUrl: string
  scopes: string[]

  getSelf: (token: string, tokenSecret: string) => Promise<ExternalAccount | FlashMessage | null>
}

type OAuthToken = {
  clientId: string
  clientSecret: string
  token?: string
  tokenSecret?: string
}

type Authorization = {
  nonce: string
  secret: string
}

type ProviderResponse = {
  oauth_token: string
  oauth_token_secret: string
  oauth_callback_confirmed?: boolean
}

export type AuthenticatedRequestInit = Omit<RequestInit, 'body'> & { body?: Record<string, any> | null, token: OAuthToken }

export type AuthenticatedResponse = { nonce: string, response: Response }

function rfcUriEncode (data: string | ParsedUrlQueryInput) {
  return (typeof data === 'string' ? encodeURIComponent(data) : encode(data))
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

export async function authenticatedFetch (url: string | URL, init: AuthenticatedRequestInit) {
  url = new URL(url)
  const tokenSecret = init.token.tokenSecret ? rfcUriEncode(init.token.tokenSecret) : ''
  const secret = rfcUriEncode(init.token.clientSecret)

  const nonce = randomUUID()
  const params: Record<string, any> = {
    ...init.body || {},
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_nonce: nonce,
    oauth_version: '1.0A',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_consumer_key: init.token.clientId,
  }

  if (init.token.token) params.oauth_token = init.token.token

  const paramsPair = Object.entries(params).sort(
    ([ ka, va ], [ kb, vb ]) =>
      ka === kb
        ? va > vb ? 1 : -1
        : ka > kb ? 1 : -1
  )

  const method = init.method?.toUpperCase() ?? 'GET'
  const paramsString = paramsPair.map(([ k, v ]) => `${rfcUriEncode(k)}=${rfcUriEncode(v)}`).join('&')
  const sigBase = `${method}&${rfcUriEncode(url.href)}&${rfcUriEncode(paramsString)}`
  paramsPair.push([ 'oauth_signature', createHmac('sha1', `${secret}&${tokenSecret}`).update(sigBase).digest('base64') ])
  const authorization = paramsPair.filter(([ k ]) => k.startsWith('oauth_')).map(([ k, v ]) => `${k}="${rfcUriEncode(v)}"`).join(',')

  return {
    nonce: nonce,
    response: await fetch(url, {
      ...init,
      headers: {
        ...init.headers || {},
        authorization: `OAuth ${authorization}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: init.body ? encode(init.body) : null,
    }),
  }
}

const pending = new Map<string, Authorization>()

export async function authorize (ctx: APIContext, oauth: OAuth1Params) {
  const intent = ctx.url.searchParams.get('intent') ?? 'login'
  const callbackUrl = new URL('callback', ctx.url).href

  const { nonce, response } = await authenticatedFetch(oauth.requestUrl, {
    method: 'POST',
    token: { clientId: oauth.clientId, clientSecret: oauth.clientSecret },
    headers: { 'user-agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)' },
    body: { oauth_callback: callbackUrl },
  })

  if (!response.ok) {
    setFlash(ctx, 'E_OAUTH_10A_EXCHANGE')
    return null
  }

  const requestToken = decode(await response.text()) as unknown as ProviderResponse
  if (!requestToken.oauth_callback_confirmed) {
    setFlash(ctx, 'E_OAUTH_10A_EXCHANGE')
    return null
  }

  const fullToken = `${ctx.params.platform}-${requestToken.oauth_token}-${intent}`
  pending.set(fullToken, { nonce: nonce, secret: requestToken.oauth_token_secret })
  setTimeout(() => pending.delete(fullToken), 300e3)

  ctx.cookies.set('nonce', nonce, { path: callbackUrl, maxAge: 300, httpOnly: true, secure: import.meta.env.PROD })
  ctx.cookies.set('intent', intent, { path: callbackUrl, maxAge: 300, httpOnly: true, secure: import.meta.env.PROD })
  return ctx.redirect(`${oauth.authorizationUrl}?oauth_token=${requestToken.oauth_token}`)
}

export async function callback ({ url, params, cookies }: APIContext, oauth: OAuth1Params) {
  const nonceCookie = cookies.get('nonce').value
  const intentCookie = cookies.get('intent').value
  const token = url.searchParams.get('oauth_token')
  const verifier = url.searchParams.get('oauth_verifier')

  if (!nonceCookie || !intentCookie || !token || !verifier) {
    return null
  }

  const fullToken = `${params.platform}-${token}-${intentCookie}`
  const authorization = pending.get(fullToken)
  if (!authorization || nonceCookie !== authorization.nonce) {
    return null
  }

  pending.delete(fullToken)
  const { response } = await authenticatedFetch(oauth.tokenUrl, {
    method: 'POST',
    headers: { 'user-agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)' },
    body: { oauth_verifier: verifier },
    token: {
      clientId: oauth.clientId,
      clientSecret: oauth.clientSecret,
      token: token,
      tokenSecret: authorization.secret,
    },
  })

  if (!response.ok) {
    return null
  }

  const tokens = decode(await response.text()) as unknown as ProviderResponse
  const user = await oauth.getSelf(tokens.oauth_token, tokens.oauth_token_secret)
  if (!user) {
    return null
  }

  return user
}

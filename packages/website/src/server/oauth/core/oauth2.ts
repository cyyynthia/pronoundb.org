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
import type { FlashMessage } from '../../flash.js'

import { randomUUID } from 'crypto'
import { encode } from 'querystring'

export type OAuth2Params = {
  oauthVersion: 2
  clientId: string
  clientSecret: string

  authorizationUrl: string
  tokenUrl: string
  scopes: string[]

  getSelf: (token: string) => Promise<ExternalAccount | FlashMessage | null>
}

const states = new Set<string>()

export async function authorize ({ url, params, cookies, redirect, site }: APIContext, oauth: OAuth2Params) {
  const intent = url.searchParams.get('intent') ?? 'login'
  const callbackPath = new URL('callback', url).pathname
  const callbackUrl = new URL(callbackPath, site)

  const state = randomUUID()
  const fullState = `${params.platform}-${state}-${intent}`
  setTimeout(() => states.delete(fullState), 300e3)
  states.add(fullState)

  const q = encode({
    state: state,
    response_type: 'code',
    scope: oauth.scopes.join(' '),
    client_id: oauth.clientId,
    redirect_uri: callbackUrl.href,
  })

  cookies.set('state', state, { path: callbackUrl.pathname, maxAge: 300, httpOnly: true, secure: import.meta.env.PROD })
  cookies.set('intent', intent, { path: callbackUrl.pathname, maxAge: 300, httpOnly: true, secure: import.meta.env.PROD })
  return redirect(`${oauth.authorizationUrl}?${q}`)
}

export async function callback ({ url, params, cookies, site }: APIContext, oauth: OAuth2Params) {
  const stateCookie = cookies.get('state').value
  const intentCookie = cookies.get('intent').value
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code')

  if (!stateCookie || !intentCookie || !state || !code) {
    return 'E_CSRF'
  }

  const fullState = `${params.platform}-${state}-${intentCookie}`
  const expectedState = `${params.platform}-${stateCookie}-${intentCookie}`
  if (fullState !== expectedState || !states.delete(fullState)) {
    return 'E_CSRF'
  }

  const cleanRedirectUrl = new URL(url.pathname, site)
  const res = await fetch(oauth.tokenUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)',
      authorization: `Basic ${Buffer.from(`${oauth.clientId}:${oauth.clientSecret}`).toString('base64')}`,
    },
    body: encode({
      state: state,
      client_id: oauth.clientId,
      client_secret: oauth.clientSecret,
      redirect_uri: cleanRedirectUrl.href,
      scope: oauth.scopes.join(' '),
      grant_type: 'authorization_code',
      code: code,
    }),
  })

  if (!res.ok) {
    return null
  }

  const { access_token: accessToken } = await res.json()
  if (!accessToken) {
    return null
  }

  const user = await oauth.getSelf(accessToken)
  if (!user) {
    return 'E_OAUTH_FETCH'
  }

  return user
}

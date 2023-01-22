/*
 * Copyright (c) Cynthia Rey, All rights reserved.
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
import { authenticatedFetch } from '../core/oauth10a.js'

export const oauthVersion = 1
export const clientId = import.meta.env.OAUTH_TWITTER_CLIENT
export const clientSecret = import.meta.env.OAUTH_TWITTER_SECRET

export const requestUrl = 'https://api.twitter.com/oauth/request_token'
export const authorizationUrl = 'https://api.twitter.com/oauth/authorize'
export const tokenUrl = 'https://api.twitter.com/oauth/access_token'
export const scopes = []

export async function getSelf (token: string, secret: string): Promise<ExternalAccount | FlashMessage | null> {
  const { response } = await authenticatedFetch('https://api.twitter.com/1.1/account/verify_credentials.json', {
    headers: {
      'user-agent': 'PronounDB Authentication Agent/2.0 (+https://pronoundb.org)',
    },
    token: {
      clientId: clientId,
      clientSecret: clientSecret,
      tokenSecret: secret,
      token: token,
    },
  })

  if (!response.ok) return null
  const data = await response.json()

  return { id: data.id_str, name: `${data.name} (@${data.screen_name})`, platform: 'twitter' }
}

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

import type { FastifyInstance } from 'fastify'
import type { ExternalAccount } from '@pronoundb/shared'
import oauth10a, { SecuredClient } from './abstract/oauth10a.js'
import { httpClientOptions } from '../util.js'
import config from '../config.js'

const [ clientId, clientSecret ] = config.oauth.twitter

const apiClient = new SecuredClient('https://api.twitter.com:443', httpClientOptions)

async function getSelf (token: string, secret: string): Promise<ExternalAccount | null> {
  const { response } = await apiClient.securedRequest({
    method: 'GET',
    path: '/1.1/account/verify_credentials.json',
    headers: {
      'user-agent': 'PronounDB Authentication Agent/1.0 (+https://pronoundb.org)',
    },
    token: {
      clientId: clientId,
      clientSecret: clientSecret,
      tokenSecret: secret,
      token: token,
    },
  })

  if (response.statusCode !== 200) return null
  const data = await response.body.json()

  return { id: data.id_str, name: `${data.name} (@${data.screen_name})`, platform: 'twitter' }
}

export default async function (fastify: FastifyInstance) {
  fastify.register(oauth10a, {
    data: {
      platform: 'twitter',
      clientId: clientId,
      clientSecret: clientSecret,
      authorizationEndpoint: 'https://api.twitter.com/oauth/authorize',
      scopes: [],

      httpClient: apiClient,
      requestPath: '/oauth/request_token',
      tokenPath: '/oauth/access_token',
      getSelf: getSelf,
    },
  })
}

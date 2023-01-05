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

import { Client } from 'undici'
import oauth2 from './abstract/oauth2.js'
import { httpClientOptions } from '../util.js'
import config from '../config.js'

const [ clientId, clientSecret ] = config.oauth.facebook

const graphClient = new Client('https://graph.facebook.com:443', httpClientOptions)

function yeetToken (token: string): void {
  // Don't even bother awaiting the Promise
  graphClient.request({
    method: 'DELETE',
    path: '/v13.0/me/permissions',
    headers: {
      authorization: `Bearer ${token}`,
      'user-agent': 'PronounDB Authentication Agent/1.0 (+https://pronoundb.org)',
    },
  })
}

async function getSelf (token: string, state: string): Promise<ExternalAccount | string | null> {
  const headers = {
    authorization: `Bearer ${token}`,
    'user-agent': 'PronounDB Authentication Agent/1.0 (+https://pronoundb.org)',
  }
  const encodedId = state.split(';;;')[1]
  if (!encodedId) {
    yeetToken(token)
    return 'ERR_NO_EXT_DATA'
  }

  const realId = Buffer.from(encodedId, 'base64').toString()
  if (!realId.match(/^\d+$/)) {
    yeetToken(token)
    return null
  }

  const selfResponse = await graphClient.request({ method: 'GET', path: '/v13.0/me', headers: headers })
  if (selfResponse.statusCode !== 200) {
    yeetToken(token)
    return null
  }

  const data = await selfResponse.body.json()
  const checkResponse = await graphClient.request({ method: 'GET', path: `/v13.0/?ids=${data.id},${realId}`, headers: headers })
  if (checkResponse.statusCode !== 200) {
    yeetToken(token)
    return null
  }

  const check = await checkResponse.body.json()
  if (Object.keys(check).length !== 1) {
    yeetToken(token)
    return null
  }

  yeetToken(token)
  return { id: realId, name: data.name, platform: 'facebook' }
}

export default async function (fastify: FastifyInstance) {
  fastify.register(oauth2, {
    data: {
      platform: 'facebook',
      clientId: clientId,
      clientSecret: clientSecret,
      authorizationEndpoint: 'https://www.facebook.com/v13.0/dialog/oauth',
      scopes: [],

      httpClient: graphClient,
      tokenPath: '/v13.0/oauth/access_token',
      getSelf: getSelf,

      transformState: (state) => state.split(';;;')[0],
    },
  })
}

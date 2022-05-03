/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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

const [ clientId, clientSecret ] = config.oauth.twitch

const apiClient = new Client('https://api.twitch.tv:443', httpClientOptions)
const idClient = new Client('https://id.twitch.tv:443', httpClientOptions)

async function getSelf (token: string): Promise<ExternalAccount | null> {
  const request = await apiClient.request({
    method: 'GET',
    path: '/helix/users',
    headers: {
      authorization: `Bearer ${token}`,
      'client-id': clientId,
    },
  })

  if (request.statusCode !== 200) return null
  const data = await request.body.json()

  return { id: data.data[0].id, name: data.data[0].display_name, platform: 'twitch' }
}

export default async function (fastify: FastifyInstance) {
  fastify.register(oauth2, {
    data: {
      platform: 'twitch',
      clientId: clientId,
      clientSecret: clientSecret,
      authorizationEndpoint: 'https://id.twitch.tv/oauth2/authorize',
      scopes: [],

      httpClient: idClient,
      tokenPath: '/oauth2/token',
      getSelf: getSelf,
    },
  })
}

/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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
import register, { securedFetch } from './abstract/oauth10a.js'
import config from '../config.js'

const [ clientId, clientSecret ] = config.oauth.twitter

async function getSelf (token: string, secret: string): Promise<ExternalAccount> {
  const data = await securedFetch('https://api.twitter.com/1.1/account/verify_credentials.json', 'GET', null, {
    clientId: clientId,
    clientSecret: clientSecret,
    tokenSecret: secret,
    token: token,
  }).then((r) => r.response.json() as any)

  return { id: data.id_str, name: `${data.name} (@${data.screen_name})`, platform: 'twitter' }
}

export default async function (fastify: FastifyInstance) {
  register(fastify, {
    clientId: clientId,
    clientSecret: clientSecret,
    platform: 'twitter',
    request: 'https://api.twitter.com/oauth/request_token',
    authorization: 'https://api.twitter.com/oauth/authorize',
    token: 'https://api.twitter.com/oauth/access_token',
    scopes: [],
    getSelf: getSelf,
  })
}

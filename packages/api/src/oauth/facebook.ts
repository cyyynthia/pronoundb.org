/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
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

import fetch from 'node-fetch'
import register from './abstract/oauth2.js'
import config from '../config.js'

const [ clientId, clientSecret ] = config.oauth.facebook

function yeetToken (token: string): void {
  // Don't even bother awaiting the Promise
  fetch('https://graph.facebook.com/v9.0/me/permissions', { method: 'DELETE', headers: { authorization: `Bearer ${token}` } })
}

async function getSelf (token: string, state: string): Promise<ExternalAccount | null> {
  const headers = { authorization: `Bearer ${token}` }
  const encodedId = state.split(';;;')[1]
  if (!encodedId) {
    yeetToken(token)
    return null
  }

  const realId = Buffer.from(encodedId, 'base64').toString()
  if (!realId.match(/^\d+$/)) {
    yeetToken(token)
    return null
  }

  const data = await fetch('https://graph.facebook.com/v9.0/me', { headers: headers }).then((r) => r.json() as any)
  const check = await fetch(`https://graph.facebook.com/v9.0/?ids=${data.id},${realId}`, { headers: headers }).then((r) => r.json() as any)
  if (Object.keys(check).length !== 1) {
    yeetToken(token)
    return null
  }

  yeetToken(token)
  return { id: realId, name: data.name, platform: 'facebook' }
}

export default async function (fastify: FastifyInstance) {
  register(fastify, {
    clientId: clientId,
    clientSecret: clientSecret,
    platform: 'facebook',
    authorization: 'https://www.facebook.com/v9.0/dialog/oauth',
    token: 'https://graph.facebook.com/v9.0/oauth/access_token',
    scopes: [],
    getSelf: getSelf,
    transformState: (state) => state.split(';;;')[0],
  })
}

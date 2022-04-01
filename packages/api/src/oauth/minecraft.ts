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

import fetch from 'node-fetch'
import register from './abstract/oauth2.js'
import config from '../config.js'

const [ clientId, clientSecret ] = config.oauth.microsoft

async function getSelf (token: string): Promise<ExternalAccount | string | null> {
  // Sign into Xbox Live
  const xliveReq = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
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

  if (!xliveReq.ok) return null
  const xlive = await xliveReq.json() as any

  // Get a security token
  const xstsReq = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      Properties: {
        SandboxId: 'RETAIL',
        UserTokens: [ xlive.Token ],
      },
      RelyingParty: 'rp://api.minecraftservices.com/',
      TokenType: 'JWT',
    }),
  })

  if (!xstsReq.ok) {
    if (xstsReq.status === 401) {
      const error = await xstsReq.json() as any
      if (error.XErr === 2148916233) return 'ERR_XLIVE_NO_ACCOUNT'
      if (error.XErr === 2148916235) return 'ERR_XLIVE_UNAVAILABLE'
      if (error.XErr === 2148916238) return 'ERR_XLIVE_CHILD'
    }
    return null
  }
  const xsts = await xstsReq.json() as any

  // Sign into Minecraft
  const minecraftReq = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ identityToken: `XBL3.0 x=${xlive.DisplayClaims.xui[0].uhs};${xsts.Token}` }),
  })

  if (!minecraftReq.ok) return null
  const minecraftToken = await minecraftReq.json() as any

  // User data wooo
  const profileReq = await fetch('https://api.minecraftservices.com/minecraft/profile', {
    headers: {
      authorization: `Bearer ${minecraftToken.access_token}`,
      accept: 'application/json',
    },
  })

  if (!profileReq.ok) return null
  const data = await profileReq.json() as any
  if (!data.id) return 'ERR_XLIVE_NO_MC_LICENSE'

  const uuid = `${data.id.slice(0, 8)}-${data.id.slice(8, 12)}-${data.id.slice(12, 16)}-${data.id.slice(16, 20)}-${data.id.slice(20)}`
  return { id: uuid, name: data.name, platform: 'minecraft' }
}

export default async function (fastify: FastifyInstance) {
  register(fastify, {
    clientId: clientId,
    clientSecret: clientSecret,
    platform: 'minecraft',
    authorization: 'https://login.live.com/oauth20_authorize.srf',
    token: 'https://login.live.com/oauth20_token.srf',
    scopes: [ 'XboxLive.signin', 'offline_access' ],
    getSelf: getSelf,
  })
}

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

import { PassThrough } from 'stream'
import { Client } from 'undici'
import oauth2 from './abstract/oauth2.js'
import { httpClientOptions } from '../util.js'
import config from '../config.js'

const [ clientId, clientSecret ] = config.oauth.microsoft

const loginLiveClient = new Client('https://login.live.com:443', httpClientOptions)
const userAuthXblClient = new Client('https://user.auth.xboxlive.com:443', httpClientOptions)
const xstsAuthXblClient = new Client('https://xsts.auth.xboxlive.com:443', httpClientOptions)
const minecraftClient = new Client('https://api.minecraftservices.com:443', httpClientOptions)

async function getSelf (token: string): Promise<ExternalAccount | string | null> {
  // We initiate all requests at the same time to handle authentication more efficiently

  const xliveBody = new PassThrough()
  const xstsBody = new PassThrough()
  const minecraftBody = new PassThrough()
  const headers = { 'content-type': 'application/json', accept: 'application/json' }
  const abortCtrl = new AbortController()

  const xliveReq = userAuthXblClient.request({
    method: 'POST',
    path: '/user/authenticate',
    headers: headers,
    body: xliveBody,
  })

  const xstsReq = xstsAuthXblClient.request({
    method: 'POST',
    path: '/xsts/authorize',
    headers: headers,
    body: xstsBody,
    signal: abortCtrl.signal,
  })

  const minecraftReq = minecraftClient.request({
    method: 'POST',
    path: '/authentication/login_with_xbox',
    headers: headers,
    body: minecraftBody,
    signal: abortCtrl.signal,
  })

  /// AUTHENTICATION PIPELINE BEGIN

  // Begin Xbox Live Auth
  xliveBody.end(
    JSON.stringify({
      Properties: {
        AuthMethod: 'RPS',
        SiteName: 'user.auth.xboxlive.com',
        RpsTicket: `d=${token}`,
      },
      RelyingParty: 'http://auth.xboxlive.com',
      TokenType: 'JWT',
    })
  )

  const xliveRes = await xliveReq
  console.log(xliveRes)
  if (xliveRes.statusCode !== 200) {
    abortCtrl.abort()
    xstsBody.destroy()
    minecraftBody.destroy()
    return null
  }

  const xlive = await xliveRes.body.json()
  // End Xbox Live Auth

  // Begin Xbox XSTS Auth
  xstsBody.end(
    JSON.stringify({
      Properties: {
        SandboxId: 'RETAIL',
        UserTokens: [ xlive.Token ],
      },
      RelyingParty: 'rp://api.minecraftservices.com/',
      TokenType: 'JWT',
    })
  )

  const xstsRes = await xstsReq
  console.log(xstsRes)
  if (xstsRes.statusCode !== 200) {
    abortCtrl.abort()
    minecraftBody.destroy()

    if (xstsRes.statusCode === 401) {
      const error = await xstsRes.body.json()
      if (error.XErr === 2148916233) return 'ERR_XLIVE_NO_ACCOUNT'
      if (error.XErr === 2148916235) return 'ERR_XLIVE_UNAVAILABLE'
      if (error.XErr === 2148916238) return 'ERR_XLIVE_CHILD'
    }

    return null
  }

  const xsts = await xstsRes.body.json()
  // End Xbox XSTS Auth

  // Begin Minecraft Auth
  minecraftBody.end(JSON.stringify({ identityToken: `XBL3.0 x=${xlive.DisplayClaims.xui[0].uhs};${xsts.Token}` }))
  const minecraftRes = await minecraftReq
  console.log(minecraftRes)
  if (minecraftRes.statusCode !== 200) return null

  const minecraftToken = await minecraftRes.body.json()
  // End Minecraft Auth

  /// AUTHENTICATION PIPELINE END

  // User data wooo
  const profileRes = await minecraftClient.request({
    method: 'GET',
    path: '/minecraft/profile',
    headers: {
      authorization: `Bearer ${minecraftToken.access_token}`,
      accept: 'application/json',
    },
  })

  if (profileRes.statusCode !== 200) return null
  const data = await profileRes.body.json()
  if (!data.id) return 'ERR_XLIVE_NO_MC_LICENSE'

  const uuid = `${data.id.slice(0, 8)}-${data.id.slice(8, 12)}-${data.id.slice(12, 16)}-${data.id.slice(16, 20)}-${data.id.slice(20)}`
  return { id: uuid, name: data.name, platform: 'minecraft' }
}

export default async function (fastify: FastifyInstance) {
  fastify.register(oauth2, {
    data: {
      platform: 'minecraft',
      clientId: clientId,
      clientSecret: clientSecret,
      authorizationEndpoint: 'https://login.live.com/oauth20_authorize.srf',
      scopes: [ 'XboxLive.signin' ],

      httpClient: loginLiveClient,
      tokenPath: '/oauth20_token.srf',
      getSelf: getSelf,
    },
  })
}

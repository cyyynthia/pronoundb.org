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

import type { Dispatcher } from 'undici'
import type { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify'
import type { ExternalAccount } from '@pronoundb/shared'
import type { OAuthIntent } from './shared.js'
import type { ConfiguredReply } from '../../util.js'
import { randomBytes, createHmac } from 'crypto'
import { encode, decode } from 'querystring'
import { Client } from 'undici'
import { finishUp } from './shared.js'
import { rfcUriEncode } from '../../util.js'
import config from '../../config.js'

interface AuthorizeRequestProps {
  Querystring: { intent?: OAuthIntent }
}

interface CallbackRequestProps {
  Querystring: {
    denied?: string
    oauth_token: string
    oauth_verifier: string
  }
}

export type AuthorizeRequest = FastifyRequest<AuthorizeRequestProps>
export type CallbackRequest = FastifyRequest<CallbackRequestProps>
export interface OAuth10aOptions {
  platform: string
  clientId: string
  clientSecret: string
  authorizationEndpoint: string
  scopes: string[]

  httpClient: SecuredClient
  requestPath: string
  tokenPath: string
  getSelf: (token: string, state: string) => Promise<ExternalAccount | string | null>
}

type OAuthToken = {
  clientId: string
  clientSecret: string
  token?: string
  tokenSecret?: string
}

type Authorization = { nonce: string, secret: string }

type ProviderResponse = {
  oauth_token: string
  oauth_token_secret: string
  oauth_callback_confirmed?: boolean
}

const authorizeSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        enum: [ 'register', 'login', 'link' ],
      },
    },
  },
}

const callbackSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      oauth_token: { type: 'string' },
      oauth_verifier: { type: 'string' },
    },
  },
}

export type SecuredRequestOptions = Omit<Dispatcher.RequestOptions, 'body'> & { body?: Record<string, any> | null, token: OAuthToken }
export type SecuredResponse = { nonce: string, response: Dispatcher.ResponseData }
export class SecuredClient extends Client {
  #base: string

  constructor (url: string | URL, options?: Client.Options) {
    super(url, options)
    this.#base = new URL(url).origin
  }

  async securedRequest (options: SecuredRequestOptions): Promise<SecuredResponse> {
    const tokenSecret = options.token.tokenSecret ? rfcUriEncode(options.token.tokenSecret) : ''
    const secret = rfcUriEncode(options.token.clientSecret)

    const nonce = randomBytes(16).toString('hex')
    const params: Record<string, any> = {
      ...options.body || {},
      oauth_timestamp: String(Math.floor(Date.now() / 1000)),
      oauth_nonce: nonce,
      oauth_version: '1.0A',
      oauth_signature_method: 'HMAC-SHA1',
      oauth_consumer_key: options.token.clientId,
    }

    if (options.token.token) params.oauth_token = options.token.token

    const paramsPair = Object.entries(params).sort(
      ([ ka, va ], [ kb, vb ]) =>
        ka === kb
          ? va > vb ? 1 : -1
          : ka > kb ? 1 : -1
    )

    const paramsString = paramsPair.map(([ k, v ]) => `${rfcUriEncode(k)}=${rfcUriEncode(v)}`).join('&')
    const sigBase = `${options.method.toUpperCase()}&${rfcUriEncode(this.#base + options.path)}&${rfcUriEncode(paramsString)}`
    paramsPair.push([ 'oauth_signature', createHmac('sha1', `${secret}&${tokenSecret}`).update(sigBase).digest('base64') ])
    const authorization = paramsPair.filter(([ k ]) => k.startsWith('oauth_')).map(([ k, v ]) => `${k}="${rfcUriEncode(v)}"`).join(',')

    const response = await this.request({
      ...options,
      headers: {
        ...options.headers || {},
        authorization: `OAuth ${authorization}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: options.body ? encode(options.body) : void 0,
    })

    return { nonce: nonce, response: response }
  }
}

const pending = new Map<string, Authorization>()

export async function authorize (this: FastifyInstance, request: AuthorizeRequest, reply: ConfiguredReply<FastifyReply, OAuth10aOptions>) {
  const intent = request.query.intent ?? 'login'

  if ('user' in request && request.user && intent !== 'link') {
    reply.redirect('/me')
    return
  }

  if ((!('user' in request) || !request.user) && intent === 'link') {
    reply.redirect('/')
    return
  }

  const redirect = request.routerPath.replace('authorize', 'callback')
  const { nonce, response } = await reply.context.config.httpClient.securedRequest({
    method: 'POST',
    path: reply.context.config.requestPath,
    token: { clientId: reply.context.config.clientId, clientSecret: reply.context.config.clientSecret },
    body: { oauth_callback: `${config.host}${redirect}` },
  })

  if (response.statusCode !== 200) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const requestToken = decode(await response.body.text()) as unknown as ProviderResponse
  if (!requestToken.oauth_callback_confirmed) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const fullToken = `${reply.context.config.platform}-${requestToken.oauth_token}`
  pending.set(fullToken, { nonce: nonce, secret: requestToken.oauth_token_secret })
  setTimeout(() => pending.delete(fullToken), 300e3)

  reply.setCookie('nonce', nonce, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .setCookie('intent', intent, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .redirect(`${reply.context.config.authorizationEndpoint}?oauth_token=${requestToken.oauth_token}`)
}

export async function callback (this: FastifyInstance, request: CallbackRequest, reply: ConfiguredReply<FastifyReply, OAuth10aOptions>) {
  if (request.query.denied || !request.query.oauth_token || !request.query.oauth_verifier) {
    if (request.query.denied) pending.delete(request.query.denied)
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const nonceCookie = reply.unsignCookie(request.cookies.nonce)
  const intentCookie = reply.unsignCookie(request.cookies.intent)
  const fullToken = `${reply.context.config.platform}-${request.query.oauth_token}`
  if (!nonceCookie.valid || !intentCookie.valid || !pending.has(fullToken)) {
    reply.redirect('/')
    return
  }

  const authorization = pending.get(fullToken)!
  if (nonceCookie.value !== authorization.nonce) {
    reply.redirect('/')
    return
  }

  const { response } = await reply.context.config.httpClient.securedRequest({
    method: 'POST',
    path: reply.context.config.tokenPath,
    token: {
      clientId: reply.context.config.clientId,
      clientSecret: reply.context.config.clientSecret,
      token: request.query.oauth_token,
      tokenSecret: authorization.secret,
    },
    body: { oauth_verifier: request.query.oauth_verifier },
  })

  if (response.statusCode !== 200) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const tokens = decode(await response.body.text()) as unknown as ProviderResponse
  const user = await reply.context.config.getSelf(tokens.oauth_token, tokens.oauth_token_secret)
  if (!user || typeof user === 'string') {
    reply.redirect(`/?error=${user || 'ERR_OAUTH_GENERIC'}`)
    return
  }

  return finishUp.call(this, request, reply, intentCookie.value as OAuthIntent, user)
}

export default async function (fastify: FastifyInstance, { data: cfg }: { data: OAuth10aOptions }) {
  fastify.get<AuthorizeRequestProps, OAuth10aOptions>('/authorize', { schema: authorizeSchema, config: cfg }, authorize)
  fastify.get<CallbackRequestProps, OAuth10aOptions>('/callback', { schema: callbackSchema, config: cfg }, callback)
}

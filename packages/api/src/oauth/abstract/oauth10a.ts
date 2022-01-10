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

import type { FastifyInstance, FastifyRequest, FastifyReply, FastifySchema } from 'fastify'
import type { ExternalAccount } from '@pronoundb/shared'
import type { OAuthIntent } from './shared.js'
import type { ConfiguredReply } from '../../util.js'
import { randomBytes, createHmac } from 'crypto'
import { encode, decode } from 'querystring'
import fetch from 'node-fetch'
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
  request: string
  authorization: string
  token: string
  scopes: string[]
  getSelf: (token: string, secret: string) => Promise<ExternalAccount>
}

interface OAuthToken {
  clientId: string
  clientSecret: string
  token?: string
  tokenSecret?: string
}

type Authorization = { nonce: string, secret: string }

interface ProviderResponse {
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

function authorizeRequest (method: string, url: string, body: Record<string, any>, token: OAuthToken) {
  const tokenSecret = token.tokenSecret ? rfcUriEncode(token.tokenSecret) : ''
  const secret = rfcUriEncode(token.clientSecret)

  const nonce = randomBytes(16).toString('hex')
  const params: Record<string, any> = {
    ...body,
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_nonce: nonce,
    oauth_version: '1.0A',
    oauth_signature_method: 'HMAC-SHA1',
    oauth_consumer_key: token.clientId,
  }

  if (token.token) params.oauth_token = token.token

  const paramsPair = Object.entries(params).sort(
    ([ ka, va ], [ kb, vb ]) =>
      ka === kb
        ? va > vb ? 1 : -1
        : ka > kb ? 1 : -1
  )

  const paramsString = paramsPair.map(([ k, v ]) => `${rfcUriEncode(k)}=${rfcUriEncode(v)}`).join('&')
  const sigBase = `${method.toUpperCase()}&${rfcUriEncode(url)}&${rfcUriEncode(paramsString)}`
  paramsPair.push([ 'oauth_signature', createHmac('sha1', `${secret}&${tokenSecret}`).update(sigBase).digest('base64') ])
  const authorization = paramsPair.filter(([ k ]) => k.startsWith('oauth_')).map(([ k, v ]) => `${k}="${rfcUriEncode(v)}"`).join(',')
  return { nonce: nonce, authorization: authorization }
}

export async function securedFetch (url: string, method: string, body: Record<string, any> | null, token: OAuthToken) {
  const { nonce, authorization } = authorizeRequest(method, url, body ?? {}, token)
  return {
    nonce: nonce,
    response: await fetch(url, {
      method: method,
      headers: {
        authorization: `OAuth ${authorization}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: body ? encode(body) : void 0,
    }),
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
  const body = { oauth_callback: `${config.host}${redirect}` }
  const token = { clientId: reply.context.config.clientId, clientSecret: reply.context.config.clientSecret }
  const requestToken = await securedFetch(reply.context.config.request, 'POST', body, token)

  if (requestToken.response.status !== 200) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const response = decode(await requestToken.response.text()) as unknown as ProviderResponse
  if (!response.oauth_callback_confirmed) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const fullToken = `${reply.context.config.platform}-${response.oauth_token}`
  pending.set(fullToken, { nonce: requestToken.nonce, secret: response.oauth_token_secret })
  setTimeout(() => pending.delete(fullToken), 300e3)

  reply.setCookie('nonce', requestToken.nonce, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .setCookie('intent', intent, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .redirect(`${reply.context.config.authorization}?oauth_token=${response.oauth_token}`)
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

  const body = { oauth_verifier: request.query.oauth_verifier }
  const token = {
    clientId: reply.context.config.clientId,
    clientSecret: reply.context.config.clientSecret,
    token: request.query.oauth_token,
    tokenSecret: authorization.secret,
  }

  const { response } = await securedFetch(reply.context.config.token, 'POST', body, token)
  if (response.status !== 200) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const tokens = decode(await response.text()) as unknown as ProviderResponse
  const user = await reply.context.config.getSelf(tokens.oauth_token, tokens.oauth_token_secret)
  if (!user) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  return finishUp.call(this, request, reply, intentCookie.value as OAuthIntent, user)
}

export default function (fastify: FastifyInstance, cfg: OAuth10aOptions) {
  fastify.get<AuthorizeRequestProps, OAuth10aOptions>('/authorize', { schema: authorizeSchema, config: cfg }, authorize)
  fastify.get<CallbackRequestProps, OAuth10aOptions>('/callback', { schema: callbackSchema, config: cfg }, callback)
}

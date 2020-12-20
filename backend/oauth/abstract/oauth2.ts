/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
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
import { encode } from 'querystring'
import { randomBytes } from 'crypto'
import fetch from 'node-fetch'
import { finishUp } from './shared'
import type { ExternalUser, OAuthIntent } from './shared'
import type { ConfiguredReply } from '../../util'

const config = require('../../../config.json')

interface AuthorizeRequestProps {
  Querystring: { intent?: OAuthIntent }
}

interface CallbackRequestProps {
  Querystring: {
    code: string
    error?: string
    state: string
  }
}

export type AuthorizeRequest = FastifyRequest<AuthorizeRequestProps>
export type CallbackRequest = FastifyRequest<CallbackRequestProps>
export interface OAuth2Options {
  platform: string
  clientId: string
  clientSecret: string
  authorization: string
  token: string
  scopes: string[]
  getSelf: (token: string) => Promise<ExternalUser>
}

const authorizeSchema: FastifySchema = {
  querystring: {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        enum: [ 'register', 'login', 'link' ]
      }
    }
  }
}

const callbackSchema: FastifySchema = {
  querystring: {
    type: 'object',
    minProperties: 2,
    required: [ 'state' ],
    properties: {
      code: { type: 'string' },
      error: { type: 'string' },
      state: { type: 'string' }
    }
  }
}

const nonces = new Set<string>()

export async function authorize (this: FastifyInstance, request: AuthorizeRequest, reply: ConfiguredReply<FastifyReply, OAuth2Options>) {
  const intent = request.query.intent ?? 'login'

  if (Object.prototype.hasOwnProperty.call(request, 'user') && intent !== 'link') {
    reply.redirect('/me')
    return
  }

  if (!Object.prototype.hasOwnProperty.call(request, 'user') && intent === 'link') {
    reply.redirect('/')
    return
  }

  const nonce = randomBytes(16).toString('hex')
  const fullNonce = `${reply.context.config.platform}-${nonce}`
  setTimeout(() => nonces.delete(fullNonce), 300e3)
  nonces.add(fullNonce)

  const redirect = request.routerPath.replace('authorize', 'callback')
  const q = encode({
    state: nonce,
    response_type: 'code',
    scope: reply.context.config.scopes.join(' '),
    client_id: reply.context.config.clientId,
    redirect_uri: `${config.host}${redirect}`
  })

  reply.setCookie('nonce', nonce, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .setCookie('intent', intent, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .redirect(`${reply.context.config.authorization}?${q}`)
}

export async function callback (this: FastifyInstance, request: CallbackRequest, reply: ConfiguredReply<FastifyReply, OAuth2Options>) {
  if (Object.prototype.hasOwnProperty.call(request.query, 'error') || !request.query.code) {
    reply.redirect('/')
    return
  }

  const nonceCookie = reply.unsignCookie(request.cookies.nonce)
  const intentCookie = reply.unsignCookie(request.cookies.intent)
  if (!nonceCookie.valid || !intentCookie.valid) {
    reply.redirect('/')
    return
  }

  const fullNonce = `${reply.context.config.platform}-${request.query.state}`
  const expectedNonce = `${reply.context.config.platform}-${nonceCookie.value}`
  if (fullNonce !== expectedNonce || !nonces.has(fullNonce)) {
    reply.redirect('/')
    return
  }

  nonces.delete(fullNonce)
  let accessToken = null
  try {
    const token = await fetch(reply.context.config.token, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      },
      body: encode({
        state: request.query.state,
        client_id: reply.context.config.clientId,
        client_secret: reply.context.config.clientSecret,
        redirect_uri: `${config.host}${request.routerPath}`,
        scope: reply.context.config.scopes.join(' '),
        grant_type: 'authorization_code',
        code: request.query.code
      })
    }).then(r => r.json())
    accessToken = token.access_token
  } catch {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  if (!accessToken) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const user = await reply.context.config.getSelf(accessToken)
  if (!user) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  return finishUp.call(this, request, reply, intentCookie.value as OAuthIntent, user)
}

export default function (fastify: FastifyInstance, config: OAuth2Options) {
  fastify.get<AuthorizeRequestProps, OAuth2Options>('/authorize', { schema: authorizeSchema, config }, authorize)
  fastify.get<CallbackRequestProps, OAuth2Options>('/callback', { schema: callbackSchema, config }, callback)
}

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
import { randomBytes } from 'crypto'
import { encode } from 'querystring'
import { finishUp } from './shared.js'
import config from '../../config.js'

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
  authorizationEndpoint: string
  scopes: string[]

  httpClient: Dispatcher
  tokenPath: string
  getSelf: (token: string, state: string) => Promise<ExternalAccount | string | null>

  // The extension sometimes use the nonce to carry additional data
  transformState?: (state: string) => string
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
    minProperties: 2,
    required: [ 'state' ],
    properties: {
      code: { type: 'string' },
      error: { type: 'string' },
      state: { type: 'string' },
    },
  },
}

const states = new Set<string>()

export async function authorize (this: FastifyInstance, request: AuthorizeRequest, reply: ConfiguredReply<FastifyReply, OAuth2Options>) {
  const intent = request.query.intent ?? 'login'

  if ('user' in request && request.user && intent !== 'link') {
    reply.redirect('/me')
    return
  }

  if ((!('user' in request) || !request.user) && intent === 'link') {
    reply.redirect('/')
    return
  }

  const state = randomBytes(16).toString('hex')
  const fullState = `${reply.context.config.platform}-${state}`
  setTimeout(() => states.delete(fullState), 300e3)
  states.add(fullState)

  const redirect = request.routerPath.replace('authorize', 'callback')
  const q = encode({
    state: state,
    response_type: 'code',
    scope: reply.context.config.scopes.join(' '),
    client_id: reply.context.config.clientId,
    redirect_uri: `${config.host}${redirect}`,
  })

  reply.setCookie('state', state, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .setCookie('intent', intent, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
    .redirect(`${reply.context.config.authorizationEndpoint}?${q}`)
}

export async function callback (this: FastifyInstance, request: CallbackRequest, reply: ConfiguredReply<FastifyReply, OAuth2Options>) {
  if ('error' in request.query || !request.query.code) {
    reply.redirect('/')
    return
  }

  if (!request.cookies.state || !request.cookies.intent) {
    reply.redirect('/')
    return
  }

  const stateCookie = reply.unsignCookie(request.cookies.state)
  const intentCookie = reply.unsignCookie(request.cookies.intent)
  if (!stateCookie.valid || !intentCookie.valid) {
    reply.redirect('/')
    return
  }

  const realState = reply.context.config.transformState
    ? reply.context.config.transformState(request.query.state)
    : request.query.state

  const fullState = `${reply.context.config.platform}-${realState}`
  const expectedState = `${reply.context.config.platform}-${stateCookie.value}`
  if (fullState !== expectedState || !states.has(fullState)) {
    reply.redirect('/')
    return
  }

  states.delete(fullState)
  let accessToken = null
  try {
    const { httpClient, tokenPath } = reply.context.config
    const response = await httpClient.request({
      method: 'POST',
      path: tokenPath,
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: encode({
        state: request.query.state,
        client_id: reply.context.config.clientId,
        client_secret: reply.context.config.clientSecret,
        redirect_uri: `${config.host}${request.routerPath}`,
        scope: reply.context.config.scopes.join(' '),
        grant_type: 'authorization_code',
        code: request.query.code,
      }),
    })

    if (response.statusCode !== 200) {
      reply.redirect('/?error=ERR_OAUTH_GENERIC')
      return
    }

    const token = await response.body.json()
    accessToken = token.access_token
  } catch {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  if (!accessToken) {
    reply.redirect('/?error=ERR_OAUTH_GENERIC')
    return
  }

  const user = await reply.context.config.getSelf(accessToken, request.query.state)
  if (!user || typeof user === 'string') {
    reply.redirect(`/?error=${user || 'ERR_OAUTH_GENERIC'}`)
    return
  }

  return finishUp.call(this, request, reply, intentCookie.value as OAuthIntent, user)
}

export default async function (fastify: FastifyInstance, { data: cfg }: { data: OAuth2Options }) {
  fastify.get<AuthorizeRequestProps, OAuth2Options>('/authorize', { schema: authorizeSchema, config: cfg }, authorize)
  fastify.get<CallbackRequestProps, OAuth2Options>('/callback', { schema: callbackSchema, config: cfg }, callback)
}

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

import { encode } from 'querystring'
import { randomBytes } from 'crypto'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fetch from 'node-fetch'

const config = require('../../config.json')

export interface Self { id: string, name: string }

export interface OAuthDescriptor {
  service: string
  clientId: string
  clientSecret: string
  authorization: string
  token: string
  scopes: string[]
  nonceKey?: string
  getSelf: (token: string) => Promise<Self>
}

export default function (oauth: OAuthDescriptor) {
  return async function (fastify: FastifyInstance) {
    const nonceKey = oauth.nonceKey ?? 'nonce'
    const nonces = new Set()

    function authorize (request: FastifyRequest, reply: FastifyReply) {
      const query = request.query as Record<string, string>
      const intent = query.intent ?? 'login'
      if (Object.prototype.hasOwnProperty.call(request, 'user') && intent !== 'link') {
        reply.redirect('/me')
        return
      }

      const nonce = randomBytes(16).toString('hex')
      setTimeout(() => nonces.delete(nonce), 300e3)
      nonces.add(nonce)

      const redirect = request.routerPath.replace('authorize', 'callback')
      const q = encode({
        [nonceKey]: nonce,
        scope: oauth.scopes.join(' '),
        response_type: 'code',
        client_id: oauth.clientId,
        redirect_uri: `${config.host}${redirect}`,
      })

      reply.setCookie('nonce', nonce, { path: redirect, signed: true, maxAge: 300, httpOnly: true })
      reply.setCookie('intent', intent, { path: redirect, maxAge: 300, httpOnly: true })
      reply.redirect(`${oauth.authorization}?${q}`)
    }

    async function callback (request: FastifyRequest, reply: FastifyReply) {
      if (typeof request.query !== 'object' || !request.query) return
      const query = request.query as Record<string, string>

      if (
        !query[nonceKey] || !query.code || query.error || !request.cookies.nonce ||
        query[nonceKey] !== reply.unsignCookie(request.cookies.nonce) || !nonces.has(query[nonceKey])
      ) {
        reply.redirect('/')
        return
      }

      nonces.delete(query[nonceKey])
      let accessToken
      try {
        const token = await fetch(oauth.token, {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: encode({
            client_id: oauth.clientId,
            client_secret: oauth.clientSecret,
            redirect_uri: `${config.host}${request.routerPath}`,
            scope: oauth.scopes.join(' '),
            grant_type: 'authorization_code',
            code: query.code
          })
        }).then(r => r.json())
        accessToken = token.access_token
      } catch (e) {
        reply.redirect('/?error=1')
        return
      }

      if (!accessToken) {
        reply.redirect('/?error=1')
        return
      }

      const user = await oauth.getSelf(accessToken)
      const mongoAcc = { service: oauth.service, ...user }
      if (!user) {
        reply.redirect('/?error=1')
        return
      }

      let collection = fastify.mongo.db.collection('accounts')
      let account = await collection.findOne({ 'accounts.id': user.id, 'accounts.service': oauth.service })
      if (request.cookies.intent === 'link') {
        if (account) {
          reply.redirect('/me?error=4')
          return
        }

        const uid = (request as any).user._id
        await collection.updateOne({ _id: uid }, { $push: { accounts: mongoAcc }})
        reply.redirect('/me')
        return
      }

      const reg = request.cookies.intent === 'register'
      if (account && reg) {
        reply.redirect('/?error=3')
        return
      }

      if (!account) {
        if (!reg) {
          reply.redirect('/?error=2')
          return
        }
  
        const res = await collection.insertOne({ accounts: [ mongoAcc ] })
        account = res.ops[0]
      }

      const tok = fastify.tokenize.generate(account._id.toString())
      reply.setCookie('token', tok, { maxAge: 365 * 24 * 3600, path: '/' }).redirect(`/me`)
    }

    fastify.get('/authorize', authorize)
    fastify.get('/callback', callback)
  }
}

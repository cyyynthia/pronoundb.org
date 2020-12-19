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

import Fastify from 'fastify'
import fastifyAuth from 'fastify-auth'
import fastifyMongo from 'fastify-mongodb'
import fastifyCookie from 'fastify-cookie'
import fastifyTokenize from 'fastify-tokenize'

import apiModule from './api'
import webModule from './web'
import shieldsModule from './shields'

const config = require('../config.json')
const fastify = Fastify({ logger: true })


type Account = { platform: string, id: string }
const isEqual = (a: Account, b: Account) => a.platform === b.platform && a.id === b.id

fastify.register(fastifyAuth)
fastify.register(fastifyCookie)
fastify.register(fastifyMongo, { url: 'mongodb://localhost:27017/pronoundb' })
fastify.register(fastifyTokenize, {
  secret: config.secret,
  fastifyAuth: true,
  header: false,
  cookie: 'token',
  // todo: filter useful fields
  fetchAccount: async (id: string) => {
    const user = await fastify.mongo.db!.collection('accounts').findOne({ _id: new fastify.mongo.ObjectId(id) })
    if (user) {
      user.lastTokenReset = 0
      user.admin = Boolean(user.accounts.find((acc: Account) => config.admins.find((a: Account) => isEqual(acc, a))))
    }
    return user
  }
})

fastify.register(apiModule, { prefix: '/api/v1' })
fastify.register(shieldsModule, { prefix: '/shields' })
fastify.register(async function (fastify) {
  await fastify.mongo.db!.collection('accounts').createIndex({ 'accounts.id': 1, 'accounts.platform': 1 })

  fastify.get('/robots.txt', (_, reply) => void reply.type('text/plain').send('User-agent: nsa\nDisallow: /'))
  fastify.get('*', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, webModule)
})

fastify.listen(config.port, (e) => {
  if (e) {
    console.error(e)
    process.exit(1)
  }
})

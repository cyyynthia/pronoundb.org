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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { Pronouns, Supported } from './shared'

function getMe (request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user
  reply.send({
    pronouns: user.pronouns ?? 'unspecified',
    accounts: user.accounts
  })
}

async function updateMe (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  if (typeof request.body !== 'object' && !Object.prototype.hasOwnProperty.call(request.body, 'pronouns')) {
    reply.code(400).send({ error: 400, message: 'Invalid form body' })
    return
  }

  const pronouns = (request.body as Record<string, string>).pronouns
  if (!Object.prototype.hasOwnProperty.call(Pronouns, pronouns)) {
    reply.code(400).send({ error: 400, message: 'Invalid form body' })
    return
  }

  await this.mongo.db.collection('accounts').updateOne({ _id: this.mongo.ObjectId((request as any).user._id) }, { $set: { pronouns } })
  reply.code(204).send()
}

async function deleteMe (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  await this.mongo.db.collection('accounts').deleteOne({ _id: this.mongo.ObjectId((request as any).user._id) })
  reply.code(204).send()
}

async function deleteConnection (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const query = request.query as Record<string, string>
  if (!Supported.includes(query.platform)) {
    reply.code(400).send({ error: 400, message: 'Unsupported platform' })
    return
  }

  if (typeof query.id !== 'string') {
    reply.code(400).send({ error: 400, message: 'Invalid ID' })
    return
  }

  await this.mongo.db.collection('accounts').updateOne(
    { _id: this.mongo.ObjectId((request as any).user._id) },
    { $pull: { accounts: { platform: query.platform, id: query.id } } }
  )
  reply.code(204).send()
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, getMe)
  fastify.post('/me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, updateMe)
  fastify.delete('/me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, deleteMe)
  fastify.delete('/me/connection', { preHandler: fastify.auth([ fastify.verifyTokenizeToken ]) }, deleteConnection)
}

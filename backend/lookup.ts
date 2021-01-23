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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { Supported } from './shared'

async function lookup (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  reply.header('access-control-allow-origin', '*')

  const query = request.query as Record<string, string>
  if (!Supported.includes(query.platform)) {
    reply.code(400).send({ error: 400, message: 'Unsupported platform' })
    return
  }

  if (typeof query.id !== 'string') {
    reply.code(400).send({ error: 400, message: 'Invalid ID' })
    return
  }

  const account = await this.mongo.db!.collection('accounts').findOne(
    { accounts: { $elemMatch: { platform: query.platform, id: query.id } } },
    { projection: { _id: 0, pronouns: 1 } }
  )

  if (!account) {
    reply.code(404).send({ error: 404, message: 'Not Found' })
    return
  }

  reply.send({ pronouns: account.pronouns ?? 'unspecified' })
}

async function lookupBulk (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  reply.header('access-control-allow-origin', '*')

  const query = request.query as Record<string, string>
  if (!Supported.includes(query.platform)) {
    reply.code(400).send({ error: 400, message: 'Unsupported platform' })
    return
  }

  if (typeof query.ids !== 'string') {
    reply.code(400).send({ error: 400, message: 'Invalid ID' })
    return
  }

  const ids = query.ids.split(',').slice(0, 50)
  const accounts = await this.mongo.db!.collection('accounts').find(
    { accounts: { $elemMatch: { platform: query.platform, id: { $in: ids } } } },
    { projection: { _id: 0, accounts: 1, pronouns: 1 } }
  ).toArray()

  const res: Record<string, string> = {}
  for (const account of accounts) {
    for (const acc of account.accounts) {
      if (ids.includes(acc.id)) {
        res[acc.id] = account.pronouns ?? 'unspecified'
      }
    }
  }

  reply.send(res)
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/lookup', lookup)
  fastify.get('/lookup-bulk', lookupBulk)
}

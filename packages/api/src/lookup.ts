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
import type { User } from '@pronoundb/shared'
import { createHash } from 'crypto'
import { Platforms } from '@pronoundb/shared/platforms.js'

import config from './config.js'

function cors (_: FastifyRequest, reply: FastifyReply) {
  reply.header('access-control-allow-origin', '*')
  reply.header('access-control-allow-methods', 'GET')
  reply.header('access-control-allow-headers', 'x-pronoundb-source')
  reply.send()
}

async function lookup (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  reply.header('access-control-allow-origin', '*')
  reply.header('access-control-allow-methods', 'GET')
  reply.header('access-control-allow-headers', 'x-pronoundb-source')

  const query = request.query as Record<string, string>
  if (!Object.keys(Platforms).includes(query.platform)) {
    reply.code(400).send({ error: 400, message: 'Unsupported platform' })
    return
  }

  if (typeof query.id !== 'string') {
    reply.code(400).send({ error: 400, message: 'Invalid ID' })
    return
  }

  const account = await this.mongo.db!.collection<User>('accounts').findOne(
    { accounts: { $elemMatch: { platform: query.platform, id: query.id } } },
    { projection: { _id: 0, pronouns: 1 } }
  )

  const pronouns = account?.pronouns ?? 'unspecified'
  const etag = `W/"${createHash('sha256').update(config.secret).update(query.platform).update(query.id).update(pronouns).digest('base64')}"`
  reply.header('cache-control', 'public, max-age=60')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag).send({ pronouns: pronouns })
}

async function lookupBulk (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  reply.header('access-control-allow-origin', '*')
  reply.header('access-control-allow-methods', 'GET')
  reply.header('access-control-allow-headers', 'x-pronoundb-source')

  const query = request.query as Record<string, string>
  if (!Object.keys(Platforms).includes(query.platform)) {
    reply.code(400).send({ error: 400, message: 'Unsupported platform' })
    return
  }

  if (typeof query.ids !== 'string') {
    reply.code(400).send({ error: 400, message: 'Invalid ID' })
    return
  }

  const ids = query.ids.split(',').slice(0, 50).sort()
  const accounts = await this.mongo.db!.collection<User>('accounts').aggregate([
    { $match: { accounts: { $elemMatch: { platform: query.platform, id: { $in: ids } } } } },
    { $addFields: { ids: '$accounts.id' } },
    { $project: { _id: 0, ids: 1, pronouns: 1 } },
  ]).toArray()

  const hash = createHash('sha256').update(config.secret).update(query.platform)
  const res: Record<string, string> = {}
  for (const id of ids) {
    const acc = accounts.find((a) => a.ids.includes(id))
    const pronouns = acc?.pronouns ?? 'unspecified'
    hash.update(id).update(pronouns)
    res[id] = pronouns
  }

  const etag = `W/"${hash.digest('base64')}"`
  reply.header('cache-control', 'public, max-age=60')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag).send(res)
}

export default async function (fastify: FastifyInstance) {
  await fastify.mongo.db!.collection<User>('accounts').createIndex({ 'accounts.id': 1, 'accounts.platform': 1 })

  fastify.options('/lookup', cors)
  fastify.get('/lookup', lookup)

  fastify.options('/lookup-bulk', cors)
  fastify.get('/lookup-bulk', lookupBulk)
}

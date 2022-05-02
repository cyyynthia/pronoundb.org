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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { Counter, Histogram } from 'prom-client'
import type { User, MongoUser } from '@pronoundb/shared'
import { Platforms } from '@pronoundb/shared/platforms.js'

function cors (request: FastifyRequest, reply: FastifyReply, allowCreds: boolean) {
  reply.header('vary', 'origin')
  reply.header('access-control-allow-origin', '*')
  reply.header('access-control-allow-methods', 'GET')
  reply.header('access-control-allow-headers', 'x-pronoundb-source')
  reply.header('access-control-max-age', '600')

  if (allowCreds && request.headers.origin?.startsWith('moz-extension://')) {
    reply.header('access-control-allow-origin', request.headers.origin)
    reply.header('access-control-allow-credentials', 'true')
  }
}

async function lookup (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  cors(request, reply, false)
  if (request.method === 'OPTIONS') {
    reply.code(204)
    return
  }

  const counter = <Counter<string>> this.metrics.client.register.getSingleMetric('pronoundb_lookup_requests_total')
  const histogram = <Histogram<string>> this.metrics.client.register.getSingleMetric('pronoundb_lookup_query_duration_seconds')

  const query = request.query as Record<string, string>
  if (!Object.keys(Platforms).includes(query.platform)) {
    reply.code(400).send({ error: 400, message: 'Unsupported platform' })
    return
  }

  if (typeof query.id !== 'string') {
    reply.code(400).send({ error: 400, message: 'Invalid ID' })
    return
  }

  const histEnd = histogram.startTimer()

  const account = await this.mongo.db!.collection<MongoUser>('accounts').findOne(
    { accounts: { $elemMatch: { platform: query.platform, id: query.id } } },
    { projection: { _id: 0, pronouns: 1 } }
  )

  const pronouns = account?.pronouns ?? 'unspecified'
  histEnd({ cache: 'miss', method: 'single', count: 1 })
  counter.inc({ cache: 'miss', platform: query.platform, method: 'single', count: 1 })
  reply.send({ pronouns: pronouns })
}

async function lookupBulk (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  cors(request, reply, false)
  if (request.method === 'OPTIONS') {
    reply.code(204)
    return
  }

  const counter = <Counter<string>> this.metrics.client.register.getSingleMetric('pronoundb_lookup_requests_total')
  const histogram = <Histogram<string>> this.metrics.client.register.getSingleMetric('pronoundb_lookup_query_duration_seconds')

  const query = request.query as Record<string, string>
  if (!Object.keys(Platforms).includes(query.platform)) {
    reply.code(400).send({ error: 400, message: 'Unsupported platform' })
    return
  }

  if (typeof query.ids !== 'string') {
    reply.code(400).send({ error: 400, message: 'Invalid ID' })
    return
  }

  const histEnd = histogram.startTimer()

  const ids = query.ids.split(',').slice(0, 50)
  const accounts = await this.mongo.db!.collection<MongoUser>('accounts').aggregate([
    { $match: { accounts: { $elemMatch: { platform: query.platform, id: { $in: ids } } } } },
    { $addFields: { ids: '$accounts.id' } },
    { $project: { _id: 0, ids: 1, pronouns: 1 } },
  ]).toArray()

  const res: Record<string, string> = {}
  for (const id of ids) {
    const acc = accounts.find((a) => a.ids.includes(id))
    const pronouns = acc?.pronouns ?? 'unspecified'
    res[id] = pronouns
  }

  histEnd({ cache: 'miss', method: 'bulk', count: ids.length })
  counter.inc({ cache: 'miss', platform: query.platform, method: 'single', count: ids.length })
  reply.send(res)
}

async function lookupMe (this: FastifyInstance, request: FastifyRequest<{ TokenizeUser: User }>, reply: FastifyReply) {
  cors(request, reply, true)
  if (request.method === 'OPTIONS') {
    reply.code(204)
    return
  }

  reply.send({ pronouns: request.user ? request.user.pronouns ?? 'unspecified' : null })
}

export default async function (fastify: FastifyInstance) {
  await fastify.mongo.db!.collection<MongoUser>('accounts').createIndex({ 'accounts.id': 1, 'accounts.platform': 1 })

  fastify.options('/lookup', lookup)
  fastify.get('/lookup', lookup)

  fastify.options('/lookup-bulk', lookupBulk)
  fastify.get('/lookup-bulk', lookupBulk)

  fastify.options('/lookup/me', lookupMe)
  fastify.get<{ TokenizeUser: User }>('/lookup/me', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ]) }, lookupMe)
}

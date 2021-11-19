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
import type { Db } from 'mongodb'

import { createHash } from 'crypto'

import config from './config.js'

type StatsData = { users: number }

let lastFetch: number
let stats: StatsData = { users: 0 }

async function fetchStats (db: Db) {
  lastFetch = Date.now() // Update last fetch immediately to prevent concurrent re-fetches
  const usersCount = await db.collection('accounts').estimatedDocumentCount()
  stats = { users: usersCount }
}

async function getStats (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  if ((Date.now() - lastFetch) > 3600e3) {
    // Initiate a re-fetch in background, but don't wait for new data
    // We can serve stale data and wait for new one to arrive
    fetchStats(this.mongo.db!)
  }

  const etag = `W/"${createHash('sha256').update(config.secret).update(stats.users.toString()).digest('base64')}"`
  reply.header('cache-control', 'public, max-age=60')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag).send(stats)
}

export default async function (fastify: FastifyInstance) {
  await fetchStats(fastify.mongo.db!)
  fastify.get('/', getStats)
}

/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
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

import type { FastifyInstance, FastifyRequest as _FastifyRequest, FastifyReply } from 'fastify'
import { type PronounsOfUser, findPronounsOf } from '../database/account.js'

type FastifyRequest = _FastifyRequest<{ Querystring: Record<string, string> }>

async function addCorsHeaders (request: FastifyRequest, reply: FastifyReply) {
  const origin = request.headers.origin
  const isFirefox = request.headers.origin?.startsWith('moz-extension://')

  reply.header('vary', 'origin')
  reply.header('access-control-max-age', 'origin')
  reply.header('access-control-allow-methods', 'GET')
  reply.header('access-control-allow-origin', isFirefox ? origin : '*')
  reply.header('access-control-allow-headers', 'x-pronoundb-source')
  if (isFirefox) reply.header('access-control-allow-credentials', 'true')
}

function noop (_: FastifyRequest, reply: FastifyReply) {
  reply.code(204).send()
}

async function lookup (request: FastifyRequest, reply: FastifyReply) {
  const { platform, id } = request.query
  if (!platform || !id) {
    reply.code(400).send({
      errorCode: 400,
      error: 'Bad request',
      message: '`platform` and `id` query parameters are required.',
    })

    return
  }

  const cursor = findPronounsOf(platform, [ id ])
  const user = await cursor.next()
  reply.send({ pronouns: user?.pronouns ?? 'unspecified' })

  // Post-request cleanup
  await cursor.close()
}

async function lookupBulk (request: FastifyRequest, reply: FastifyReply) {
  const { platform, ids: idsStr } = request.query
  if (!platform || !idsStr) {
    reply.code(400).send({
      errorCode: 400,
      error: 'Bad request',
      message: '`platform` and `ids` query parameters are required.',
    })

    return
  }

  const ids = new Set(idsStr.split(',').filter((a) => a))
  if (ids.size < 1 || ids.size > 50) {
    reply.code(400).send({
      errorCode: 400,
      error: 'Bad request',
      message: '`ids` must contain between 1 and 50 IDs.',
    })

    return
  }

  const cursor = findPronounsOf(platform, Array.from(ids))
  const res = Object.create(null)
  let user: PronounsOfUser | null
  while ((user = await cursor.next())) {
    res[user.id] = user.pronouns
    ids.delete(user.id)
  }

  for (const id of ids) {
    res[id] = 'unspecified'
  }

  reply.send(res)

  // Post-request cleanup
  await cursor.close()
}

function lookupMe (request: FastifyRequest, reply: FastifyReply) {
  reply.send({ pronouns: request.user?.pronouns ?? 'unspecified' })
}

export default async function (fastify: FastifyInstance) {
  fastify.addHook('preHandler', addCorsHeaders)

  fastify.get('/lookup', lookup)
  fastify.get('/lookup-bulk', lookupBulk)
  fastify.get('/lookup/me', lookupMe)

  fastify.options('/lookup', noop)
  fastify.options('/lookup-bulk', noop)
  fastify.options('/lookup/me', noop)
}

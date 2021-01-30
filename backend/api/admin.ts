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

function isAdmin (request: FastifyRequest, _: FastifyReply, next: (e?: Error) => void) {
  if (!(request as any).user.admin) {
    next(new Error('You tried'))
    return
  }

  next()
}

// @ts-ignore
async function getStatus (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  return {}
}

// @ts-ignore
async function adminLookup (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  return {}
}

// @ts-ignore
async function createBan (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  return {}
}

// @ts-ignore
async function updateBan (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  return {}
}

// @ts-ignore
async function deleteBan (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  return {}
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/status', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, isAdmin ], { relation: 'and' }) }, getStatus)
  fastify.get('/lookup', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, isAdmin ], { relation: 'and' }) }, adminLookup)
  fastify.post('/bans', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, isAdmin ], { relation: 'and' }) }, createBan)
  fastify.patch('/bans/:id', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, isAdmin ], { relation: 'and' }) }, updateBan)
  fastify.delete('/bans/:id', { preHandler: fastify.auth([ fastify.verifyTokenizeToken, isAdmin ], { relation: 'and' }) }, deleteBan)
}

/*
 * Copyright (c) Cynthia Rey, All rights reserved.
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
import type { MongoUser } from '@pronoundb/shared'

import { LegacyPronouns } from '@pronoundb/shared/pronouns.js'

async function generateShield (this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const params = request.params as Record<string, string>
  if (!this.mongo.ObjectId.isValid(params.id)) {
    reply.code(400)
    return { error: 400, message: 'Invalid ID' }
  }

  const capitalize = 'capitalize' in (request.query as Record<string, string>)
  const idx = capitalize ? 1 : 0

  const id = new this.mongo.ObjectId(params.id)
  const user = await this.mongo.db!.collection<MongoUser>('accounts').findOne({ _id: id })
  const pronouns = user?.pronouns ?? 'unspecified'
  reply.send({
    schemaVersion: 1,
    label: capitalize ? 'Pronouns' : 'pronouns',
    message: (Array.isArray(LegacyPronouns[pronouns]) ? LegacyPronouns[pronouns][idx] : LegacyPronouns[pronouns])
      ?? (capitalize ? 'Unspecified' : 'unspecified'),
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.get('/:id', generateShield)
}

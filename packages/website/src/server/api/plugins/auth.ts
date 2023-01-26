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

import type { FastifyInstance } from 'fastify'
import type { Account } from '../../database/account.js'
import { getRealToken, authenticateToken } from '../../auth.js'

export default async function authPlugin (fastify: FastifyInstance) {
  fastify.decorateRequest('user', null)

  fastify.addHook('preHandler', async (request, reply) => {
    request.user = null
    if (request.cookies.token) {
      let token = request.cookies.token
      const migration = !token.startsWith('ey')
      if (migration) {
        // Legacy Tokenize migration
        const newToken = getRealToken(token)
        if (!newToken) {
          reply.clearCookie('token')
          return
        }

        token = newToken
      }

      request.user = await authenticateToken(token)
      if (!request.user) {
        reply.clearCookie('token')
      }

      if (migration) {
        // Legacy Tokenize migration pt. 2
        reply.setCookie('token', token, { path: '/', maxAge: 365 * 24 * 3600, httpOnly: true, secure: import.meta.env.PROD })
      }
    }
  })
}

// Mark as root-level plugin
// @ts-ignore -- TS isn't happy about that one
authPlugin[Symbol.for('skip-override')] = true
// @ts-ignore -- TS isn't happy about that one
authPlugin[Symbol.for('fastify.display-name')] = '@pronoundb/auth'
// @ts-ignore -- TS isn't happy about that one
authPlugin[Symbol.for('plugin-meta')] = {
  fastify: '4.x',
  name: '@pronoundb/auth',
  decorators: { request: [ 'cookies' ] },
  dependencies: [ '@fastify/cookie' ],
}

declare module 'fastify' {
  export interface FastifyRequest {
    user: Account | null
  }
}

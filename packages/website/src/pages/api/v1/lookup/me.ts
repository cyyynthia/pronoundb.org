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

import type { APIContext } from 'astro'
import { authenticate } from '@server/auth.js'

function getCorsHeaders (request: APIContext['request']) {
  const origin = request.headers.get('origin')
  const isFirefox = request.headers.get('origin')?.startsWith('moz-extension://')

  return isFirefox
    ? {
      vary: 'origin',
      'access-control-allow-methods': 'GET',
      'access-control-allow-origin': origin!,
      'access-control-allow-headers': 'x-pronoundb-source',
      'access-control-allow-credentials': 'true',
      'access-control-max-age': '600',
    }
    : {
      vary: 'origin',
      'access-control-allow-methods': 'GET',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'x-pronoundb-source',
      'access-control-max-age': '600',
    }
}

export async function get (ctx: APIContext) {
  const user = await authenticate(ctx, true)
  const body = JSON.stringify({ pronouns: user?.pronouns ?? 'unspecified' })
  return new Response(body, { headers: getCorsHeaders(ctx.request) })
}

export function options ({ request }: APIContext) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  })
}

export function all () {
  return new Response(JSON.stringify({ statusCode: 405, error: 'Method not allowed' }), { status: 405 })
}

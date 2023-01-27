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

import type { APIContext } from 'astro'

import { authenticate } from '@server/auth.js'
import { type OAuth1Params, authorize as authorize1 } from '@server/oauth/core/oauth10a.js'
import { type OAuth2Params, authorize as authorize2 } from '@server/oauth/core/oauth2.js'

type Params = OAuth1Params | OAuth2Params
const INTENTS = [ 'register', 'login', 'link' ]
const platforms = import.meta.glob<Params>('../../../server/oauth/platforms/*.ts', { eager: true })

export async function get (ctx: APIContext) {
  const platform = platforms[`../../../server/oauth/platforms/${ctx.params.platform}.ts`]
  if (!platform) return new Response('400: Invalid provider', { status: 400 })

  const token = ctx.cookies.get('token').value
  const intent = ctx.url.searchParams.get('intent') ?? 'login'
  const user = token ? await authenticate(ctx) : null

  if (!INTENTS.includes(intent)) {
    return new Response('400: Invalid intent', { status: 400 })
  }

  if ((intent === 'register' || intent === 'login') && user) {
    return ctx.redirect('/me')
  }

  if (intent === 'link' && !user) {
    return ctx.redirect('/')
  }

  switch (platform.oauthVersion) {
    case 1:
      return authorize1(ctx, platform) ?? ctx.redirect(intent === 'link' ? '/me' : '/')
    case 2:
      return authorize2(ctx, platform)
  }
}

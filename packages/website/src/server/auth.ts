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
import { createHash, createHmac } from 'crypto'
import { createSigner, createVerifier } from 'fast-jwt'

export type JwtPayload = { id: string }

const KEY = createHash('sha256').update(import.meta.env.SECRET_KEY).digest()

const signer = createSigner({
  key: KEY,
  algorithm: 'HS256',
  expiresIn: 72 * 3600e3, // 3 days
  header: { alg: 'HS256' },
})

const verifierStrict = createVerifier({
  key: KEY,
  algorithms: [ 'HS256' ],
  cache: true,
  errorCacheTTL: 600e3,
})

const verifierLax = createVerifier({
  key: KEY,
  algorithms: [ 'HS256' ],
  ignoreExpiration: true,
  cache: true,
})

export function generateToken (payload: JwtPayload): string {
  return signer(payload)
}

export function authenticate ({ cookies }: APIContext, lax?: boolean): JwtPayload | null {
  let token = cookies.get('token').value
  if (!token) return null

  const verifier = lax ? verifierLax : verifierStrict

  try {
    return verifier(token)
  } catch {
    return null
  }
}

// Legacy tokenize migration
export function migrateAuth ({ cookies }: APIContext) {
  let token = cookies.get('token').value
  if (!token || token.startsWith('ey')) return

  if (!import.meta.env.LEGACY_SECRET_KEY) return

  const [ id, gen, sig ] = token.split('.')
  if (!id || !gen || !sig) return

  const expectedSig = createHmac('sha256', import.meta.env.LEGACY_SECRET_KEY)
    .update(`TTF.1.${id}.${gen}`)
    .digest('base64')
    .replace(/=/g, '')

  if (!safeEqual(sig, expectedSig)) return

  token = generateToken({ id: Buffer.from(id, 'base64').toString() })
  cookies.set('token', token, { path: '/', maxAge: 365 * 24 * 3600, httpOnly: true, secure: import.meta.env.PROD })
}

function safeEqual (str1: string, str2: string) {
  if (str1.length !== str2.length) return false

  let mismatch = 0
  for (let i = 0; i < str1.length; i++) {
    mismatch |= str1.charCodeAt(i) ^ str2.charCodeAt(i)
  }

  return mismatch === 0
}

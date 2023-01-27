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
import { ObjectId } from 'mongodb'
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'
import { createSigner, createVerifier } from 'fast-jwt'
import { LegacyTokenizeMigrationCounter } from './metrics.js'
import { findById } from './database/account.js'

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

export function hasValidToken ({ cookies }: APIContext) {
  let token = cookies.get('token').value
  if (!token) return false

  try {
    verifierStrict(token)
    return true
  } catch {
    return false
  }
}

export async function authenticate ({ cookies }: APIContext, lax?: boolean) {
  let token = cookies.get('token').value
  if (!token) return null

  const verifier = lax ? verifierLax : verifierStrict

  try {
    const { id } = verifier(token)
    return findById(new ObjectId(id))
  } catch {
    // Not deleting the token if invalid is intentional. This allows the extension to still show up pronouns.
    return null
  }
}

const csrfStore = new Map<string, Buffer>()
export function createCsrf ({ cookies }: APIContext): string {
  const token = cookies.get('token').value
  if (!token) throw new Error('Cannot generate CSRF tokens for unauthenticated requests.')

  const stored = csrfStore.get(token)
  if (stored) return stored.toString('base64url')

  const csrf = randomBytes(64)
  csrfStore.set(token, csrf)
  setTimeout(() => csrfStore.delete(token), 300e3)
  return csrf.toString('base64url')
}

export function validateCsrf ({ cookies }: APIContext, csrf: string) {
  const token = cookies.get('token').value
  if (!token) throw new Error('Cannot validate CSRF tokens for unauthenticated requests.')

  const expected = csrfStore.get(token)
  if (!expected) return false

  csrfStore.delete(token)
  const csrfBuffer = Buffer.from(csrf, 'base64url')
  return expected.length === csrfBuffer.length && timingSafeEqual(expected, csrfBuffer)
}

// Legacy tokenize migration
export function migrateAuth ({ cookies }: APIContext) {
  if (!import.meta.env.LEGACY_SECRET_KEY) return

  let token = cookies.get('token').value
  if (!token || token.startsWith('ey')) return

  const [ id, gen, sig ] = token.split('.')
  if (!id || !gen || !sig) return

  const expectedSig = createHmac('sha256', import.meta.env.LEGACY_SECRET_KEY)
    .update(`TTF.1.${id}.${gen}`)
    .digest('base64')
    .replace(/=/g, '')

  if (!safeEqual(sig, expectedSig)) return

  LegacyTokenizeMigrationCounter.inc()
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

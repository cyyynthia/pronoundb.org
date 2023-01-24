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
import { ObjectId } from 'mongodb'
import { findById } from '../../server/database/account.js'

export const LegacyPronouns: Record<string, string | string[]> = {
  // -- Contributors: please keep the list sorted alphabetically.
  hh: [ 'he/him', 'He/Him' ],
  hi: [ 'he/it', 'He/It' ],
  hs: [ 'he/she', 'He/She' ],
  ht: [ 'he/they', 'He/They' ],
  ih: [ 'it/him', 'It/Him' ],
  ii: [ 'it/its', 'It/Its' ],
  is: [ 'it/she', 'It/She' ],
  it: [ 'it/they', 'It/They' ],
  shh: [ 'she/he', 'She/He' ],
  sh: [ 'she/her', 'She/Her' ],
  si: [ 'she/it', 'She/It' ],
  st: [ 'she/they', 'She/They' ],
  th: [ 'they/he', 'They/He' ],
  ti: [ 'they/it', 'They/It' ],
  ts: [ 'they/she', 'They/She' ],
  tt: [ 'they/them', 'They/Them' ],
  // --
  any: 'Any pronouns',
  other: 'Other pronouns',
  ask: 'Ask me my pronouns',
  avoid: 'Avoid pronouns, use my name',
}


function formatPronouns (pronounsId: string, capitalize: boolean) {
  const pronouns = LegacyPronouns[pronounsId]
  return Array.isArray(pronouns) ? pronouns[capitalize ? 0 : 1] : pronouns
}

export async function get ({ url, params }: APIContext) {
  if (!params.id || !ObjectId.isValid(params.id)) {
    return new Response('400: Bad request', { status: 400 })
  }

  const id = new ObjectId(params.id)
  const user = await findById(id)

  if (!user || user.pronouns === 'unspecified') {
    return {
      body: JSON.stringify({
        schemaVersion: 1,
        label: 'error',
        message: 'not found',
        isError: true,
      }),
    }
  }

  const capitalize = url.searchParams.has('capitalize')
  return {
    body: JSON.stringify({
      schemaVersion: 1,
      label: capitalize ? 'Pronouns' : 'pronouns',
      message: formatPronouns(user.pronouns, capitalize),
    }),
  }
}

export function all () {
  return new Response('405: Method not allowed', { status: 405 })
}

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

export type Platforms = 'discord' | 'github' | 'twitch' | 'twitter'

export const Supported = [ 'discord', 'github', 'twitch', 'twitter' ]

export const Pronouns = Object.freeze({
  unspecified: null,
  avoid: 'Avoid pronouns, use my name',
  any: 'Any pronouns',
  // -- Contributors: please keep the list sorted alphabetically.
  hh: 'he/him',
  hs: 'he/she',
  ht: 'he/they',
  shh: 'she/he',
  sh: 'she/her',
  st: 'she/they',
  th: 'they/he',
  ts: 'they/she',
  tt: 'they/them',
  // --
  other: 'Other pronouns',
  ask: 'Ask me my pronouns'
})

export const PronounsShort = Object.freeze({
  ...Pronouns,
  avoid: 'Avoid',
  any: 'Any',
  other: 'Other',
  ask: 'Ask me'
})

export const PlatformNames = Object.freeze({
  discord: 'Discord',
  github: 'GitHub',
  twitch: 'Twitch',
  twitter: 'Twitter'
})

export const WEBSITE = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://pronoundb.org'

export const Endpoints = Object.freeze({
  LOOKUP: (platform: string, id: string) => `${WEBSITE}/api/v1/lookup?platform=${platform}&id=${id}`,
  LOOKUP_BULK: (platform: string, ids: string[]) => `${WEBSITE}/api/v1/lookup-bulk?platform=${platform}&ids=${ids.join(',')}`
})

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

const TestPronouns: Record<string, Record<string, string>> = {
  twitter: {
    // @cyyynthia_
    1300929324154060800: 'ii',
  },
  github: {
    // cyyynthia
    9999055: 'ii',
  },
  twitch: {
    // cyyynthia_
    103493295: 'ii',
  },
  facebook: {
    // Test account associated to the PronounDB Facebook App
    100081064205146: 'sh',
  },
}

export function processRequest (urlStr: string): any {
  const url = new URL(urlStr)
  const platform = url.searchParams.get('platform')!
  if (urlStr.includes('lookup-bulk')) {
    const ids = url.searchParams.get('ids')!.split(',')
    const res: Record<string, string> = {}
    for (const id of ids) res[id] = TestPronouns[platform]?.[id] ?? 'tt'
    return res
  }

  const id = url.searchParams.get('id')!
  return { pronouns: TestPronouns[platform]?.[id] ?? 'tt' }
}

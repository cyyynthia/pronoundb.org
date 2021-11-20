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

import { useState, useEffect, useCallback } from 'preact/hooks'
import { Pronouns, PronounsShort } from './pronouns.js'

let pronounsCase = 'lower'
if (chrome.storage) {
  chrome.storage.sync.get([ 'pronouns.case' ], ({ 'pronouns.case': pCase }) => (pronounsCase = pCase ?? 'lower'))
  chrome.storage.onChanged.addListener((changes) => {
    if (changes['pronouns.case']) {
      pronounsCase = changes['pronouns.case'].newValue
    }
  })
} else {
  window.addEventListener('message', (e) => {
    if (e.data?.source === 'pronoundb' && e.data.payload.action === 'settings.pronouns.case') {
      pronounsCase = e.data.payload.pronounsCase
    }
  })
}

export function formatPronouns (id) {
  const pronouns = Pronouns[id]
  const idx = pronounsCase === 'lower' ? 0 : 1
  return Array.isArray(pronouns) ? pronouns[idx] : pronouns
}

export function formatPronounsShort (id) {
  const pronouns = PronounsShort[id]
  const idx = pronounsCase === 'lower' ? 0 : 1
  return Array.isArray(pronouns) ? pronouns[idx] : pronouns
}

export function formatPronounsLong (id) {
  switch (id) {
    case 'any':
      return 'Goes by any pronouns'
    case 'other':
      return 'Goes by pronouns not available on PronounDB'
    case 'ask':
      return 'Prefers people to ask for their pronouns'
    case 'avoid':
      return 'Wants to avoid pronouns'
    default:
      return `Goes by "${formatPronouns(id)}" pronouns`
  }
}

export function usePronouns () {
  const forceUpdate = useState(0)[1]
  const updateFormatted = useCallback((e) => {
    if (e.data.source === 'pronoundb' && e.data.payload.action === 'settings.pronouns.case') {
      forceUpdate((i) => ++i)
    }
  }, [ forceUpdate ])

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.onChanged.addListener(updateFormatted)
      return () => chrome.storage.onChanged.removeListener(updateFormatted)
    } else {
      window.addEventListener('message', updateFormatted)
      return () => window.removeEventListener('message', updateFormatted)
    }
  }, [ updateFormatted ])
}

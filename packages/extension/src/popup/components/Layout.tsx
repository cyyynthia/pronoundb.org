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

import browser from 'webextension-polyfill'
import { h } from 'preact'
import { useMemo } from 'preact/hooks'
import { usePronouns, formatPronouns } from '@pronoundb/shared/format.js'

import { ViewState } from './Views'

import Settings from 'feather-icons/dist/icons/settings.svg'
import ArrowLeft from 'feather-icons/dist/icons/arrow-left.svg'

type HeaderProps = {
  view: ViewState
  onOpenSettings: () => void
  onCloseSettings: () => void
}

type FooterProps = { selfPronouns: string | null, onOpenPronounsSelector: () => void }

const CUTE_COMMENTS = [
  'So cute!',
  'Pretty!',
  'Fits you well!',
  'That\'s adorable!',
]

const specialNotes = {
  unspecified: 'You didn\'t specify your pronouns yet.',
  other: 'You\'re going by other pronouns than the ones available on PronounDB.',
  ask: 'You want people to ask for your pronouns.',
  avoid: 'You want people to avoid using pronouns on you.',
}

export function Header ({ view, onOpenSettings, onCloseSettings }: HeaderProps) {
  return (
    <header class='px-4 py-2 border-b border-gray-200 flex'>
      {view === ViewState.SETTINGS && (
        <button class='mr-4' onClick={onCloseSettings}>
          <ArrowLeft class='w-5'/>
        </button>
      )}
      <h1 class='text-2xl font-bold'>{view === ViewState.SETTINGS ? 'Settings' : 'PronounDB'}</h1>
      {view !== ViewState.SETTINGS && (
        <button class='ml-auto' onClick={onOpenSettings}>
          <Settings class='w-5'/>
        </button>
      )}
    </header>
  )
}

export function Footer ({ selfPronouns, onOpenPronounsSelector }: FooterProps) {
  usePronouns()
  const cute = useMemo(() => Math.floor(Math.random() * CUTE_COMMENTS.length), [])

  return (
    <footer class='text-gray-600 text-sm'>
      {selfPronouns
        ? (
          <div class='py-2 px-4 border-t border-gray-200'>
            {selfPronouns in specialNotes
              ? <p>{specialNotes[selfPronouns as keyof typeof specialNotes]}</p>
              : <p>You're going by {formatPronouns(selfPronouns)}. {CUTE_COMMENTS[cute]}</p>}
            <button class='link' onClick={onOpenPronounsSelector}>Change pronouns</button>
          </div>
        )
        : (
          <div class='py-2 px-4 border-t border-gray-200'>
            <p>You're not logged in on pronoundb.org</p>
            <div class='flex gap-3'>
              <a class='link' href='https://pronoundb.org/login' target='_blank' rel='noreferrer'>Login</a>
              <a class='link' href='https://pronoundb.org/register' target='_blank' rel='noreferrer'>Register</a>
            </div>
          </div>
        )}

      <div class='py-2 px-4 flex border-t border-gray-200'>
        <p>v{browser.runtime.getManifest().version}</p>
        <div class='ml-auto flex gap-3'>
          <a class='hover:underline' href='https://pronoundb.org' target='_blank' rel='noreferrer'>Website</a>
          <a class='hover:underline' href='https://github.com/cyyynthia/pronoundb.org' target='_blank' rel='noreferrer'>GitHub</a>
          <a class='hover:underline' href='https://ko-fi.com/cyyynthia' target='_blank' rel='noreferrer'>Donate</a>
        </div>
      </div>
    </footer>
  )
}

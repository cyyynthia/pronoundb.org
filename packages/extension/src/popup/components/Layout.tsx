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

import type { RestUser } from '@pronoundb/shared'
import { h } from 'preact'
import { useMemo } from 'preact/hooks'
import { browser } from 'webextension-polyfill-ts'

const CUTE_COMMENTS = [
  'So cute!',
  'Pretty!',
  'Fits you well!',
  'That\'s adorable!',
]

export function Header () {
  return (
    <header className='px-4 py-2 border-b border-gray-200'>
      <h1 className='text-2xl font-bold'>PronounDB</h1>
    </header>
  )
}

export function Footer ({ user }: { user: RestUser | null }) {
  const cute = useMemo(() => Math.floor(Math.random() * CUTE_COMMENTS.length), [])

  return (
    <footer className='text-gray-600 text-sm'>
      {user
        ? (
          <div className='py-2 px-4 border-t border-gray-200'>
            <p>You're going by {user.pronouns}. {CUTE_COMMENTS[cute]}</p>
            <button className='link'>Change pronouns</button>
          </div>
        )
        : (
          <div className='py-2 px-4 border-t border-gray-200'>
            <p>You're not logged in on pronoundb.org</p>
            <div className='flex gap-3'>
              <a className='link' href='https://pronoundb.org/login' target='_blank' rel='noreferrer'>Login</a>
              <a className='link' href='https://pronoundb.org/register' target='_blank' rel='noreferrer'>Register</a>
            </div>
          </div>
        )}

      <div className='py-2 px-4 flex border-t border-gray-200'>
        <p>v{browser.runtime.getManifest().version}</p>
        <div className='ml-auto flex gap-3'>
          <a className='hover:underline' href='https://pronoundb.org' target='_blank' rel='noreferrer'>Website</a>
          <a className='hover:underline' href='https://github.com/cyyynthia/pronoundb.org' target='_blank' rel='noreferrer'>GitHub</a>
          <a className='hover:underline' href='https://ko-fi.com/cyyynthia' target='_blank' rel='noreferrer'>Donate</a>
        </div>
      </div>
    </footer>
  )
}

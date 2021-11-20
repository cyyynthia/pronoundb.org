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

import type { Attributes } from 'preact'
import { h } from 'preact'
import { useContext, useCallback, useState } from 'preact/hooks'
import { route } from 'preact-router'
import { useTitle } from 'hoofd/preact'
import { Pronouns } from '@pronoundb/shared/pronouns.js'
import { Platforms } from '@pronoundb/shared/platforms.js'
import { usePronouns, formatPronouns } from '@pronoundb/shared/format.js'
import PlatformIcons from '@pronoundb/shared/icons.js'

import UserContext from '../UserContext'
import { Routes, Endpoints } from '../../constants'

import UserPlus from 'feather-icons/dist/icons/user-plus.svg'
import X from 'feather-icons/dist/icons/x.svg'

export default function Account (_: Attributes) {
  usePronouns()
  useTitle('My Account')
  const user = useContext(UserContext)
  const [ , __ ] = useState(0)
  const update = __.bind(null, (i) => ++i)

  const deleteAccount = useCallback(() => {
    // eslint-disable-next-line no-alert
    if (confirm('Are you sure? This action is irreversible!')) {
      fetch(Endpoints.SELF, { method: 'DELETE' }).then(() => (location.pathname = '/'))
    }
  }, [])

  const changePronouns = useCallback((p: string) => {
    fetch(Endpoints.SELF, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pronouns: p }) })
    if (user) user.setPronouns(p)
  }, [ user ])

  const unlinkExternal = useCallback((platform: string, id: string) => {
    fetch(Endpoints.CONNECTION(platform, id), { method: 'DELETE' })
    if (user) user.removeAccount(platform, id)
    update()
  }, [ user ])

  if (user === void 0) return null
  if (!user) {
    route(Routes.HOME)
    return null
  }

  return (
    <main class='container-main'>
      <h2 class='text-2xl font-bold mb-2'>My Account</h2>
      <p class='mb-1'>Welcome back! Want to change your pronouns, or link a new account? You're at the right place!</p>
      <p class='mb-4'>
        All of the changes are saved automatically, and should take no more than a minute to apply on our end.
        In some cases, users may have pronouns in cache and will need a page reload to see the change (e.g.: on a Twitch chat)
      </p>

      <h3 class='text-xl font-bold mb-2'>Pronouns</h3>
      <p class='mb-2'>To avoid any form of biases, pronouns are sorted alphabetically.</p>
      <select class='w-full px-2 py-1 mb-8 bg-gray-200 dark:bg-gray-700' value={user.pronouns} onChange={(e) => changePronouns((e.target as any).value)}>
        {Object.keys(Pronouns).map((set) => (
          <option key={set} value={set}>
            {formatPronouns(set) ?? 'Unspecified'}
          </option>
        ))}
      </select>

      <h3 class='text-xl font-bold mb-2'>Linked accounts</h3>
      <p class='mb-2'>
        {user.accounts.length > 1
          ? 'You can add or remove accounts at any time.'
          : 'You can add a new account at any time. Because you only have a single account linked, you cannot unlink it without adding a new account.'}
      </p>

      <div class='grid gap-3 lg:grid-cols-2 mb-8'>
        {user.accounts.map((account) => (
          <div class='platform-box' style={{ borderBottomColor: Platforms[account.platform].color }}>
            {h(PlatformIcons[account.platform], { class: 'w-8 h-8 mr-4 flex-none fill-current' })}
            <span class='font-semibold flex-none'>{account.name}</span>
            {user.accounts.length > 1 && <X class='ml-auto cursor-pointer w-5 h-5' onClick={() => unlinkExternal(account.platform, account.id)}/>}
          </div>
        ))}
        <a href={Routes.LINK} class='platform-box border-gray-400 dark:border-gray-600'>
          <UserPlus class='w-8 h-8 mr-4 flex-none fill-current'/>
          <span class='font-semibold flex-none'>Add a new account</span>
        </a>
      </div>

      <h3 class='text-xl font-bold mb-2'>Advanced settings</h3>
      <p class='mb-1'>PronounDB ID: <code class='bg-gray-200 px-1 rounded dark:bg-gray-700'>{user.id}</code></p>
      <p class='mb-4'>This ID may be useful for some of the <a href={Routes.DOCS} class='link'>API endpoints</a>.</p>

      <h4 class='text-lg font-semibold mb-2'>Delete my account</h4>
      <p class='mb-1'>Want to delete your account? That's fine, I won't blame you. You can delete your account at any time by pressing the button below.</p>
      <p class='mb-4'>Be careful, the action is immediate and irreversible!</p>
      <button onClick={deleteAccount} class='text-red-600 border-red-600 font-semibold py-1 px-3 border rounded dark:text-red-orange dark:border-red-orange'>
        Delete my account
      </button>
    </main>
  )
}

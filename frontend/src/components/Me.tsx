/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
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

import { h } from 'preact'
import { useTitle } from 'hoofd/preact'
import { useCallback, useContext } from 'preact/hooks'

import { Ctx } from './AppContext'
import { Endpoints, Routes } from '@constants'
import { Pronouns, PlatformNames } from '@shared'

function Me () {
  useTitle('My account')
  const { user, logout, setPronouns, unlinkAccount } = useContext(Ctx)

  const deleteAccount = useCallback(function () {
    if (confirm('Are you sure? This action is irreversible!')) {
      fetch(Endpoints.SELF, { method: 'DELETE' }).then(() => logout())
    }
  }, [])

  const changePronouns = useCallback(function (p: string) {
    fetch(Endpoints.SELF, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pronouns: p }) })
    setPronouns(p)
  }, [ setPronouns ])

  const unlinkExternal = useCallback(function (platform: string, id: string) {
    fetch(Endpoints.CONNECTION(platform, id), { method: 'DELETE' })
    unlinkAccount(platform, id)
  }, [ unlinkAccount ])

  if (!user) return null

  return (
    <div>
      <h2>My account</h2>
      <p>
        Hi there! You can manage the accounts you've linked to PronounDB, as well as changing your pronouns if you feel
        like it.
      </p>
      <h3>My pronouns</h3>
      <p>
        To avoid any form of biases, pronouns are sorted alphabetically. Your selection will be saved automatically.
      </p>
      <select value={user.pronouns} onChange={e => changePronouns((e.target as any).value)}>
        {Object.entries(Pronouns).map(([ id, pronouns ]) => <option key={id} value={id}>{pronouns ?? 'Unspecified'}</option>)}
      </select>
      <h3>Linked accounts</h3>
      <ul>
        {user.accounts.map(account => (
          <li key={account.id}>
            {PlatformNames[account.platform]}: <b>{account.name}</b>{' - '}
            {user.accounts.length > 1
              ? <button className='link' onClick={() => unlinkExternal(account.platform, account.id)}>Unlink</button>
              : <i>Cannot unlink your only linked account.</i>}
          </li>
        ))}
        <li><a href={Routes.LINK}>Link a new account</a></li>
      </ul>
      <h3>Delete your account</h3>
      <p>
        Want to delete your account? That's fine, I won't blame you. You can delete your account at any time by
        pressing the button below. Be careful, the action is immediate and irreversible!
      </p>
      <button onClick={deleteAccount} className='link red'>Delete my account</button>
    </div>
  )
}

Me.displayName = 'Me'
export default Me

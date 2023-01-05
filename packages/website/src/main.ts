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

import type { User } from './components/UserContext'
import { RestUser } from '@pronoundb/shared'
import { h, render, hydrate } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { route } from 'preact-router'
import App from './components/App'
import { Endpoints } from './constants'

import './style.css'

let error: string | null = null
if (location.search) {
  const search = new URLSearchParams(location.search)
  error = search.get('error') ? search.get('error') : null
  setTimeout(() => route(location.pathname), 250)
}

async function fetchUser (): Promise<User> {
  return fetch(Endpoints.SELF)
    .then((r) => r.json())
    .then((u: RestUser | null) => {
      if (u?.id) {
        const ctxUser: Exclude<User, null | void> = {
          ...u,
          setPronouns: (p) => (ctxUser.pronouns = p),
          removeAccount: (platform, id) => (ctxUser.accounts = ctxUser.accounts.filter((a) => a.platform !== platform || a.id !== id)),
        }

        return ctxUser
      }

      return null
    })
}

function AppWrapper () {
  const [ user, setUser ] = useState<User>(document.cookie.includes('token=') ? void 0 : null)
  useEffect(() => {
    if (document.cookie.includes('token=')) {
      fetchUser().then(setUser)
    }
  }, [])

  return h(App, { error: error, user: user })
}

if (import.meta.env.DEV) {
  render(h(AppWrapper, null), document.querySelector('#app')!)
} else {
  hydrate(h(AppWrapper, null), document.querySelector('#app')!)
}

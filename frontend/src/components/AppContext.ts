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

import { createContext, h } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

import useCookie from '../useCookie'

import { Endpoints } from '@constants'

export interface Account { platform: string, id: string, name: string }
export interface User { id: string, pronouns: string, accounts: Account[] }

interface AppState {
  admin: boolean
  count: number
  extVersions: Record<string, string>
}

interface AppContextValue {
  appState: AppState
  user: User | false | null
  error?: string | null
  setPronouns: (pronouns: string) => void
  unlinkAccount: (platform: string, id: string) => void
  logout: () => void
}

interface AppContextProps {
  url: string
  extVersions?: Record<string, string>
  usersCount?: number
  error?: string | null
  children: ComponentChildren
}

declare global {
  interface Window {
    __STATE__?: AppState
  }
}

function sortAccounts (acc1: Account, acc2: Account) {
  const res = acc1.platform.localeCompare(acc2.platform)
  if (res === 0) {
    const max = Math.max(acc1.id.length, acc2.id.length)
    return acc1.id.padStart(max, '0').localeCompare(acc2.platform.padStart(max, '0'))
  }
  return res
}

const fakeAppState: AppState = {
  count: 6969,
  admin: true,
  extVersions: {
    chrome: '0.0.0',
    mozilla: '0.0.0',
    edge: '0.0.0',
  },
}

let appState: AppState = fakeAppState
if (typeof window !== 'undefined' && window.__STATE__) {
  appState = window.__STATE__
  delete window.__STATE__
}

export const Ctx = createContext<AppContextValue>({
  appState: fakeAppState,
  user: null,
  error: null,
  setPronouns: () => void 0,
  unlinkAccount: () => void 0,
  logout: () => void 0
})


function AppContext (props: AppContextProps) {
  const ogUrl = useMemo(() => props.url, [])
  const [ error, setError ] = useState(props.error)
  const [ user, setUser ] = useState<User | false | null>(null)
  const [ token, setToken ] = useCookie('token')

  useEffect(() => {
    if (!token) {
      setUser(false)
    } else if (!user) {
      fetch(Endpoints.SELF, { headers: { authorization: token } }).then(r => r.json()).then(u => {
        if (u.error) {
          setUser(false)
          setToken(null, -1)
        } else {
          u.accounts.sort(sortAccounts)
          setUser(u)
        }
      }).catch(() => {
        setUser(false)
        setToken(null, -1)
      })
    }
  }, [ token, user ])

  useEffect(() => {
    if (error) {
      if (ogUrl !== props.url) {
        setError(null)
        return
      }
      const timer = setTimeout(() => setError(null), 10e3)
      return () => clearTimeout(timer)
    }
  }, [ props.url, error ])

  if (props.usersCount) {
    appState.count = props.usersCount
  }

  if (props.extVersions) {
    appState.extVersions = props.extVersions
  }

  return h(Ctx.Provider, {
    value: {
      appState,
      user,
      error, 
      setPronouns: p => user && setUser({ ...user, pronouns: p }),
      unlinkAccount: (p, i) => user && setUser({ ...user, accounts: user.accounts.filter(a => a.platform !== p || a.id !== i) }),
      logout: () => setToken(null, -1)
    },
    children: props.children
  })
}

AppContext.displayName = 'AppContextWrapper'
export default AppContext

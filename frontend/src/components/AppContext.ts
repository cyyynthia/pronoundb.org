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

import { createContext, h } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

import useCookie from '../useCookie'

import { Endpoints } from '@constants'

type User = { pronouns: number | null, accounts: string[] }
interface AppContextValue {
  user: User | false | null
  logout: () => void
  error?: number | null
}

interface AppContextProps {
  error?: number | null
  children: ComponentChildren
}

export const Ctx = createContext<AppContextValue>({ user: null, logout: () => void 0, error: null })
Ctx.displayName = 'AppContext'

function AppContext (props: AppContextProps) {
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
          setUser(u)
        }
      }).catch(() => {
        setUser(false)
        setToken(null, -1)
      })
    }
  }, [ token, user ])

  return h(Ctx.Provider, { value: { user, logout: () => setToken(null, -1), error: props.error }, children: props.children })
}

AppContext.displayName = 'AppContextWrapper'
export default AppContext

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

import { h, Fragment } from 'preact'
import UserContext from './UserContext'
import { useContext, useCallback } from 'preact/hooks'
import { Routes } from '../constants'

export default function Header () {
  const user = useContext(UserContext)
  const logout = useCallback(() => {
    document.cookie = `token=; expires=${new Date(0).toUTCString()}`
    window.location.pathname = '/'
  }, [])

  return (
    <header class='container-head border-b'>
      <div class='flex-none flex items-center mr-6'> {/* todo: icon */}
        <a href={Routes.HOME} class='text-3xl font-bold'>PronounDB</a>
      </div>
      <div class='flex-none flex items-center gap-4'>
        {user
          ? (
            <Fragment>
              <a href={Routes.ME} class='link'>My account</a>
              <button onClick={logout} class='link'>Logout</button>
            </Fragment>
          )
          : (
            <Fragment>
              <a href={Routes.LOGIN} class='link'>Login</a>
              <a href={Routes.REGISTER} class='link'>Create account</a>
            </Fragment>
          )}
      </div>
    </header>
  )
}

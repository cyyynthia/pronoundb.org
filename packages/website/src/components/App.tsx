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

import type { RouterOnChangeArgs } from 'preact-router'
import type { User } from './UserContext'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { useTitleTemplate, useMeta } from 'hoofd/preact'
import Router from 'preact-router'

import UserContext from './UserContext'
import Header from './Header'
import Footer from './Footer'

import Home from './Home'
import Auth from './Auth'
import Account from './Account'
import Docs from './Docs'
import Onboarding from './Onboarding'
import Legal from './Legal'
import Privacy from './Privacy'
import NotFound from './NotFound'

import { Routes, Errors } from '../constants'

// import logo from '../assets/powercord.png'

type AppProps = { user?: User, url?: string, ctx?: Record<string, unknown>, error?: string | null }

export default function App (props: AppProps) {
  const [ showError, setShowError ] = useState(Boolean(props.error))
  const change = useCallback(({ previous }: RouterOnChangeArgs) => {
    if (typeof document !== 'undefined') document.getElementById('app')?.scrollTo(0, 0)
    if (previous && !previous.includes('?error=')) setShowError(false)
  }, [])

  useEffect(() => {
    if (showError) {
      setTimeout(() => setShowError(false), 10e3)
    }
  }, [])

  useTitleTemplate('%s • PronounDB')
  // useMeta({ name: 'og:image', content: logo })
  useMeta({ name: 'og:title', content: 'PronounDB' })
  useMeta({ name: 'og:site_name', content: 'PronounDB' })
  useMeta({ name: 'og:description', content: 'A browser extension that lets people know how to refer to each other on various places of the Internet.' })
  useMeta({ name: 'description', content: 'A browser extension that lets people know how to refer to each other on various places of the Internet.' })

  return (
    <UserContext.Provider value={props?.user}>
      <Header/>
      {showError && props.error && <p className='container mx-auto text-red-600 font-semibold text-lg p-2 text-center pb-0'>
        {Errors[props.error]}
      </p>}
      <Router url={props?.url} onChange={change}>
        <Home path={Routes.HOME}/>
        <Auth path={Routes.LOGIN} intent='login'/>
        <Auth path={Routes.REGISTER} intent='register'/>
        <Auth path={Routes.LINK} intent='link'/>
        <Account path={Routes.ME}/>
        <Docs path={Routes.DOCS}/>
        <Onboarding path={Routes.ONBOARDING}/>
        <Legal path={Routes.LEGAL}/>
        <Privacy path={Routes.PRIVACY}/>
        <NotFound ctx={props.ctx} default/>
      </Router>
      <Footer/>
    </UserContext.Provider>
  )
}

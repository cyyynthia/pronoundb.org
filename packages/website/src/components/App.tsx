/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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

import Home from './pages/Home'
import Auth from './account/Auth'
import Account from './account/Account'
import Supported from './marketing/Supported'
import Onboarding from './extension/Onboarding'
import Changelog from './extension/Changelog'
import Docs from './pages/DocsLegacy'
import Legal from './pages/Legal'
import Privacy from './pages/Privacy'
import NotFound from './pages/NotFound'

import { Routes, Errors } from '../constants'

// import logo from '../assets/powercord.png'

type AppProps = { user?: User, url?: string, error?: string | null }

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
  useMeta({ name: 'og:description', content: 'PronounDB is a browser extension that helps people know each other\'s pronouns easily and instantly. Whether hanging out on a Twitch chat, or on any of the supported platforms, PronounDB will make your life easier.' })
  useMeta({ name: 'description', content: 'PronounDB is a browser extension that helps people know each other\'s pronouns easily and instantly. Whether hanging out on a Twitch chat, or on any of the supported platforms, PronounDB will make your life easier.' })

  return (
    <UserContext.Provider value={props?.user}>
      <Header/>
      {showError && props.error && (
        <p class='container mx-auto text-red-600 font-semibold text-lg p-2 text-center pb-0'>
          {Errors[props.error as keyof typeof Errors]}
        </p>
      )}
      <Router url={props?.url} onChange={change}>
        <Home path={Routes.HOME}/>

        <Auth path={Routes.LOGIN} intent='login'/>
        <Auth path={Routes.REGISTER} intent='register'/>
        <Auth path={Routes.LINK} intent='link'/>
        <Account path={Routes.ME}/>

        <Supported path={Routes.SUPPORTED_PREVIEW(':platform?')}/>
        <Onboarding path={Routes.ONBOARDING}/>
        <Changelog path={Routes.CHANGELOG('2021-11')}/>

        <Docs path={Routes.DOCS}/>
        <Legal path={Routes.LEGAL}/>
        <Privacy path={Routes.PRIVACY}/>
        <NotFound default/>
      </Router>
      <Footer/>
    </UserContext.Provider>
  )
}

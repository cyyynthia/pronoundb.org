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
import { useState } from 'preact/hooks'
import { useMeta, useTitle } from 'hoofd/preact'
import Router from 'preact-router'

import AppContext from './AppContext'
import AuthBoundary from './AuthBoundary'
import Layout from './Layout'
import Home from './Home'
import Me from './Me'
import OAuth from './OAuth'
import Docs from './Docs'
import Notice from './Legal/Notice'
import Privacy from './Legal/Privacy'
import { Routes } from '@constants'

interface RootProps {
  url?: string
  error?: number | null
}

function Root (props: RootProps) {
  const [ url, setUrl ] = useState(props.url || location.pathname)
  useTitle(url === '/' ? 'PronounDB' : '%s • PronounDB', url !== '/')

  // useMeta({ name: 'og:image', content: avatar })
  useMeta({ name: 'og:title', content: 'PronounDB' })
  useMeta({ name: 'og:site_name', content: 'PronounDB' })
  useMeta({ name: 'og:description', content: 'Chrome/Firefox extention that lets people know how to refer to each other on various places of the Internet' })
  useMeta({ name: 'description', content: 'Chrome/Firefox extention that lets people know how to refer to each other on various places of the Internet' })
  // useLink({ rel: 'shortcut icon', href: avatar })

  return (
    <AppContext url={url} error={props.error}>
      <Layout>
        <Router url={props.url} onChange={(e) => setUrl(new URL(e.url, 'https://pronoundb.org').pathname)}>
          <Home path={Routes.HOME}/>
          <OAuth path={Routes.LOGIN} intent='login'/>
          <OAuth path={Routes.REGISTER} intent='register'/>

          <AuthBoundary path={Routes.ME}>
            <Me/>
          </AuthBoundary>
          <AuthBoundary path={Routes.LINK}>
            <OAuth intent='link'/>
          </AuthBoundary>

          <Docs path={Routes.DOCS}/>
          <Notice path={Routes.LEGAL}/>
          <Privacy path={Routes.PRIVACY}/>
        </Router>
      </Layout>
    </AppContext>
  )
}

Root.displayName = 'Root'
export default Root

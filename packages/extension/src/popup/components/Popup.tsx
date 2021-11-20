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

import type { ExtensionModule } from '../../modules'
import browser from 'webextension-polyfill'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { WEBSITE, Endpoints } from '@pronoundb/shared/constants.js'
import { Header, Footer } from './Layout'
import { ViewState } from './Views'
import * as Views from './Views'

import { getModule } from '../../modules'

function Main ({ view }: { view: ViewState }) {
  const [ mdl, setMdl ] = useState<false | null | ExtensionModule>(false)
  useEffect(() => void getModule().then((m) => setMdl(m)), [ setMdl ])

  if (view === ViewState.MAIN) {
    if (mdl === false) return null
    if (!mdl) return <Views.Unsupported/>
    return <Views.Main module={mdl}/>
  }

  if (view === ViewState.SETTINGS) {
    return <Views.Settings/>
  }

  return null
}

export default function Popup () {
  const [ user, setUser ] = useState(null)
  const [ view, setView ] = useState(ViewState.MAIN)
  const openPronounsSelector = useCallback(() => void browser.tabs.create({ url: `${WEBSITE}/me` }), [])
  const openSettings = useCallback(() => void setView(ViewState.SETTINGS), [])
  const closeSettings = useCallback(() => void setView(ViewState.MAIN), [])

  useEffect(() => {
    fetch(Endpoints.SELF)
      .then((r) => r.json())
      .then((u) => u.id && setUser(u))
      .catch()
  }, [])

  return (
    <div className='flex flex-col h-full'>
      <Header view={view} onOpenSettings={openSettings} onCloseSettings={closeSettings}/>
      <Main view={view}/>
      <Footer user={user} onOpenPronounsSelector={openPronounsSelector}/>
    </div>
  )
}

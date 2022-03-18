/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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

import type { Attributes } from 'preact'
import { h } from 'preact'
import { useRef, useCallback, useState, useEffect, useContext } from 'preact/hooks'
import { useMeta, useTitle } from 'hoofd/preact'
import { route } from 'preact-router'
import { Platforms, PlatformIds } from '@pronoundb/shared/platforms.js'
import PlatformIcons from '@pronoundb/shared/icons.js'
import { compareSemver } from '../../util'

import UserContext from '../UserContext'
import AppContext from '../AppContext'
import { Routes, Endpoints } from '../../constants'

type OAuthIntent = 'login' | 'register' | 'link'

type OAuthProps = Attributes & { intent: OAuthIntent }

const IntentTitles = {
  login: 'Login to your account',
  register: 'Register an account',
  link: 'Link another account',
}

function LinkButton ({ platformId, intent }: { platformId: string, intent: OAuthIntent }) {
  const getPdbExtVer = () => import.meta.env.SSR ? void 0 : window.__PRONOUNDB_EXTENSION_VERSION__
  const platform = Platforms[platformId]

  const divRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>()
  const [ disabled, setDisabled ] = useState(platform.requiresExt)

  function check () {
    const ver = getPdbExtVer()
    setDisabled(!ver || compareSemver(platform.since, ver) === 1)
  }

  useEffect(() => {
    if (platform.requiresExt) {
      if (getPdbExtVer()) check()
      else setTimeout(check, 200)
    }
  }, [ platformId ])

  const onMouseIn = useCallback(() => {
    const { x, y, width } = divRef.current!.getBoundingClientRect()
    const tt = document.createElement('div')
    tt.className = 'tooltip'
    tt.style.left = `${x + (width / 2)}px`
    tt.style.top = `${y}px`
    tt.style.opacity = '0'
    tt.innerText = getPdbExtVer()
      ? `You need to update the PronounDB extension to link a ${platform.name} account.`
      : `You need to install the PronounDB extension to link a ${platform.name} account.`
    document.body.appendChild(tt)

    setTimeout(() => (tt.style.opacity = '1'), 0)
    tooltipRef.current = tt
  }, [ disabled ])

  const onMouseOut = useCallback(() => {
    const tooltip = tooltipRef.current
    if (!tooltip) return

    tooltip.style.opacity = '0'
    setTimeout(() => tooltip.remove(), 150)
  }, [ tooltipRef ])

  useEffect(() => {
    if (!disabled && tooltipRef.current) {
      tooltipRef.current.remove()
    }
  }, [ disabled, tooltipRef.current ])

  if (disabled) {
    return (
      <div
        ref={divRef}
        class={`platform-box cursor-not-allowed opacity-60 border-platform-${platformId}`}
        onMouseEnter={onMouseIn}
        onMouseLeave={onMouseOut}
      >
        {h(PlatformIcons[platformId], { class: 'w-8 h-8 mr-4 flex-none' })}
        <span class='font-semibold'>Connect with {platform.name}</span>
      </div>
    )
  }

  return (
    <a
      // @ts-expect-error
      native
      class={`platform-box border-platform-${platformId}`}
      href={Endpoints.OAUTH(platformId, intent)}
    >
      {h(PlatformIcons[platformId], { class: 'w-8 h-8 mr-4 flex-none' })}
      <span class='font-semibold'>Connect with {platform.name}</span>
    </a>
  )
}

export default function Auth (props: OAuthProps) {
  useTitle(IntentTitles[props.intent])
  useMeta({ name: 'robots', content: 'noindex,nofollow' })

  const user = useContext(UserContext)
  const { ctx } = useContext(AppContext)
  const expectLoggedIn = props.intent === 'link'

  if (user !== void 0 && Boolean(user) !== expectLoggedIn) {
    const redirectTo = expectLoggedIn ? Routes.LOGIN : Routes.ME
    ctx.redirect = redirectTo
    route(redirectTo)
    return null
  }

  return (
    <main class='container-main'>
      <div class='title-context'>Authentication</div>
      <h2 class='text-2xl font-bold mb-6'>{IntentTitles[props.intent]}</h2>
      {props.intent === 'login' && <p class='mb-2'>Make sure to select an account you already linked on PronounDB.</p>}
      {props.intent === 'register' && <p class='mb-2'>Make sure to give the <a class='link' href={Routes.PRIVACY}>Privacy Policy</a> a look. Registering an account on PronounDB will be seen as an acceptance of it.</p>}

      <div class='auth-grid'>
        {PlatformIds.filter((p) => import.meta.env.DEV || !Platforms[p].soon).map((platform) =>
          <LinkButton key={platform} platformId={platform} intent={props.intent}/>)}
      </div>
    </main>
  )
}

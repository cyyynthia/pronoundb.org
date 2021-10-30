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

import type { Attributes } from 'preact'
import type { Platform, PlatformId } from '@pronoundb/shared'
import { h } from 'preact'
import { useRef, useMemo, useCallback, useState, useEffect, useContext } from 'preact/hooks'
import { useTitle } from 'hoofd/preact'
import { route } from 'preact-router'
import { Platforms, PlatformIds } from '@pronoundb/shared'
import PlatformIcons from '@pronoundb/shared/PlatformIcons'
import { compareSemver } from '../util'

import { Routes, Endpoints } from '../constants'
import UserContext from './UserContext'

type OAuthIntent = 'login' | 'register' | 'link'

type OAuthProps = Attributes & { intent: OAuthIntent }

const IntentTitles = {
  login: 'Login to your account',
  register: 'Register an account',
  link: 'Link another account',
}

function LinkButton (props: Platform & { id: PlatformId, intent: OAuthIntent }) {
  const divRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [ _, forceUpdate ] = useState(false)

  const disabled = useMemo(() => {
    if (typeof window !== 'undefined' && props.requiresExt) {
      if (!window.__PRONOUNDB_EXTENSION_VERSION__) setTimeout(() => forceUpdate(true), 200)

      if (!window.__PRONOUNDB_EXTENSION_VERSION__) return true
      if (compareSemver(props.since, window.__PRONOUNDB_EXTENSION_VERSION__) === 1) return true
    }
    return false
  }, [ props, _ ])

  const onMouseIn = useCallback(() => {
    const { x, y, width } = divRef.current!.getBoundingClientRect()
    const tt = document.createElement('div')
    tt.className = 'tooltip'
    tt.style.left = `${x + (width / 2)}px`
    tt.style.top = `${y}px`
    tt.style.opacity = '0'
    tt.innerText = window.__PRONOUNDB_EXTENSION_VERSION__
      ? `You need to update the PronounDB extension to link a ${props.name} account.`
      : `You need to install the PronounDB extension to link a ${props.name} account.`
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

  if (props.soon && import.meta.env.PROD) {
    return null
  }

  if (disabled) {
    return (
      <div
        ref={divRef}
        className='flex items-center fill-current px-4 pt-3 pb-2 font-semibold bg-gray-200 dark:bg-gray-700 border-bottom border-b-8 cursor-not-allowed opacity-60'
        style={{ borderBottomColor: props.color }}
        onMouseEnter={onMouseIn}
        onMouseLeave={onMouseOut}
      >
        {h(PlatformIcons[props.id], { className: 'w-8 h-8 mr-4 flex-none' })}
        <span>Connect with {props.name}</span>
      </div>
    )
  }

  return (
    <a
      // @ts-expect-error
      native
      className='flex items-center fill-current px-4 pt-3 pb-2 font-semibold bg-gray-200 dark:bg-gray-700 border-bottom border-b-8'
      style={{ borderBottomColor: props.color }}
      href={Endpoints.OAUTH(props.id, props.intent)}
    >
      {h(PlatformIcons[props.id], { className: 'w-8 h-8 mr-4 flex-none' })}
      <span>Connect with {props.name}</span>
    </a>
  )
}

export default function Auth (props: OAuthProps) {
  useTitle(IntentTitles[props.intent])
  const user = useContext(UserContext)
  const expectLoggedIn = props.intent === 'link'

  if (user !== void 0 && Boolean(user) !== expectLoggedIn) {
    route(expectLoggedIn ? '/login' : '/me')
    return null
  }

  return (
    <main className='container-main'>
      <div className='title-context'>Authentication</div>
      <h2 className='text-2xl font-bold mb-6'>{IntentTitles[props.intent]}</h2>
      {props.intent === 'login' && <p className='mb-2'>Make sure to select an account you already linked on PronounDB.</p>}
      {props.intent === 'register' && <p className='mb-2'>Make sure to give the <a className='link' href={Routes.PRIVACY}>Privacy Policy</a> a look. Registering an account on PronounDB will be seen as an acceptance of it.</p>}

      <div className='auth-grid'>
        {PlatformIds.map((platform) => <LinkButton key={platform} id={platform} {...Platforms[platform]} intent={props.intent}/>)}
      </div>
    </main>
  )
}

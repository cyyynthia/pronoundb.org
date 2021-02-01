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

import type { RoutableProps } from 'preact-router'
import { h } from 'preact'
import { useTitle, useMeta } from 'hoofd/preact'
import { useRef, useMemo, useCallback, useState } from 'preact/hooks'

import { Endpoints, Routes } from '@constants'
import { Platforms, } from '@shared'
import { compareSemver } from '../util'

const iconsRequire = require.context('../icons', false, /\.svg$/)

type OAuthIntent = 'login' | 'register' | 'link'

interface OAuthProps extends RoutableProps {
  intent: OAuthIntent
}

const IntentTitles = {
  login: 'Login to your account',
  register: 'Register an account',
  link: 'Link another account'
}

function LinkButton (props: typeof Platforms[string] & { id: string, intent: OAuthIntent }) {
  const divRef = useRef<HTMLDivElement>()
  const tooltipRef = useRef<HTMLDivElement>()
  const [ _, forceUpdate ] = useState(false)
  const disabled = useMemo(() => {
    if (props.since) {
      if (!window.__PRONOUNDB_EXTENSION_VERSION__) {
        setTimeout(() => forceUpdate(true), 200)
      }
      if (!window.__PRONOUNDB_EXTENSION_VERSION__) return true
      if (compareSemver(props.since, window.__PRONOUNDB_EXTENSION_VERSION__) === 1) return true
    }
    return false
  }, [ props, _ ])

  const onMouseIn = useCallback(() => {
    const { x, y, width } = divRef.current.getBoundingClientRect()
    const tt = document.createElement('div')
    tt.className = 'tooltip'
    tt.style.left = `${x + width / 2}px`
    tt.style.top = `${y}px`
    tt.style.opacity = '0'
    tt.innerText = window.__PRONOUNDB_EXTENSION_VERSION__
      ? `You need to update the PronounDB extension to link a ${props.name} account.`
      : `You need to install the PronounDB extension to link a ${props.name} account.`
    document.body.appendChild(tt)

    setTimeout(() => tt.style.opacity = '1', 0)
    tooltipRef.current = tt
  }, [ disabled ])

  const onMouseOut = useCallback(() => {
    const tooltip = tooltipRef.current
    if (!tooltip) return

    tooltip.style.opacity = '0'
    setTimeout(() => tooltip.remove(), 150)
  }, [ tooltipRef ])

  if (props.soon && process.env.NODE_ENV !== 'development') {
    return null
  }

  if (disabled) {
    return (
      <div
        className='oauth-button disabled'
        style={`--color: ${props.color}`}
        onMouseEnter={onMouseIn}
        onMouseLeave={onMouseOut}
        ref={divRef}
      >
        <img src={iconsRequire(`./${props.id}.svg`).default} alt={`${props.name}`}/>
        <span>Connect with {props.name}</span>
      </div>
    )
  }
  return (
    // @ts-expect-error
    <a native className='oauth-button' style={`--color: ${props.color}`} href={Endpoints.OAUTH(props.id, props.intent)}>
      <img src={iconsRequire(`./${props.id}.svg`).default} alt={`${props.name}`}/>
      <span>Connect with {props.name}</span>
    </a>
  )
}

function OAuth (props: OAuthProps) {
  useTitle(IntentTitles[props.intent])
  useMeta({ name: 'og:title', content: IntentTitles[props.intent] })

  return (
    <div>
      <div className='page-context'>Authentication</div>
      <h2>{IntentTitles[props.intent]}</h2>
      <p>Select an authentication provider. You will be redirected to the platform you selected to perform the authentication.</p>
      {props.intent === 'login' && <p>Make sure to select an account you already linked on PronounDB.</p>}
      {props.intent === 'register' && <p>Make sure to give the <a href={Routes.PRIVACY}>Privacy Policy</a> a look. Registering an account on PronounDB will be seen as an acceptance of those.</p>}
      <div className='oauth-buttons'>
        {Object.entries(Platforms).map(([ platformId, platform ]) => (
          <LinkButton id={platformId} intent={props.intent} {...platform}/>
        ))}
      </div>
    </div>
  )
}

OAuth.displayName = 'OAuth'
export default OAuth

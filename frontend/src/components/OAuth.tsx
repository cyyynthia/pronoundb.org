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
import { useTitle } from 'hoofd/preact'
import type { RoutableProps } from 'preact-router'

import { Endpoints, Routes } from '@constants'
import { PlatformNames, Supported } from '@shared'

interface OAuthProps extends RoutableProps {
  intent: 'login' | 'register' | 'link'
}

const IntentTitles = {
  login: 'Login to your account',
  register: 'Register an account',
  link: 'Link another account'
}

function OAuth (props: OAuthProps) {
  useTitle(IntentTitles[props.intent])

  return (
    <div>
      <div className='page-context'>Authentication</div>
      <h2>{IntentTitles[props.intent]}</h2>
      <p>Select an authentication provider. You will be redirected to the platform you selected to perform the authentication.</p>
      {props.intent === 'login' && <p>Make sure to select an account you already linked on PronounDB.</p>}
      {props.intent === 'register' && <p>Make sure to give the <a href={Routes.PRIVACY}>Privacy Policy</a> a look. Registering an account on PronounDB will be seen as an acceptance of those.</p>}
      <ul>
        {Supported.map(s => (
          <li>
            {/* @ts-expect-error */}
            <a native href={Endpoints.OAUTH(s, props.intent)}>{PlatformNames[s]}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}

OAuth.displayName = 'OAuth'
export default OAuth

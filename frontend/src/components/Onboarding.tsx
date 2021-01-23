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
import { useTitle } from 'hoofd/preact'
import { useContext } from 'preact/hooks'
import type { RoutableProps } from 'preact-router'

import { Ctx } from './AppContext'
import { Endpoints, Routes } from '@constants'
import { PlatformNames, Supported } from '@shared'

function Onboarding (_: RoutableProps) {
  const { user } = useContext(Ctx)
  useTitle('Welcome!')

  const how = user
    ? <a href={Routes.ME}>going to your account</a>
    : (
      <Fragment>
        <a href={Routes.LOGIN}>logging in</a> or <a href={Routes.REGISTER}>creating an account</a>
      </Fragment>
    )

  return (
    <div>
      <h2>Welcome!</h2>
      <p>
        Thanks for installing the extension. You'll finally no longer have to go through the trouble of reminding
        pronouns for every single person you see on the Internet!
      </p>
      <h3>Share your own pronouns</h3>
      <p>
        You can let other people know your pronouns by {how}, configuring your pronouns and linking your accounts. They
        will instantly see your pronouns show up on the accounts you linked. You can link multiple accounts per
        platform, if you're into that kind of things!
      </p>
      <h3>Feeling generous?</h3>
      <p>
        If you wish, you can <a href={Routes.DONATE} target='_blank' rel='noreferrer'>donate</a>, so I can keep buying
        enough cookies and coffee to stay alive! 🥰
      </p>        
    </div>
  )
}

Onboarding.displayName = 'Onboarding'
export default Onboarding

/*
 * Copyright (c) Cynthia Rey, All rights reserved.
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
import { h, Fragment } from 'preact'
import { useContext } from 'preact/hooks'
import { useTitleTemplate } from 'hoofd/preact'

import useHeart from '../../hooks/useHeart'
import UserContext from '../UserContext'
import { Routes } from '../../constants'

export default function Onboarding (_: Attributes) {
  useTitleTemplate('Welcome to PronounDB!')
  const loggedIn = Boolean(useContext(UserContext))

  const heart = useHeart('onboarding')
  const how = loggedIn
    ? <a class='link' href={Routes.ME}>going to your account</a>
    : <><a class='link' href={Routes.LOGIN}>logging in</a> or <a class='link' href={Routes.REGISTER}>creating an account</a></>

  return (
    <main class='container-main'>
      <h2 class='text-2xl font-bold mb-2'>Welcome!</h2>
      <p class='mb-2'>
        Thank you for installing the extension! You'll finally no longer have to go through the trouble of reminding
        pronouns for every single person you see on the Internet! Amazing!
      </p>
      <p class='mb-6'>
        Whenever you interact with someone who uses PronounDB, you'll see their pronouns show up, so you know how to
        refer to that person. It'll also show up on people's profiles, so you can lookup people's pronouns easily.
      </p>

      <h3 class='text-xl font-bold mb-2'>Share your own pronouns</h3>
      <p class='mb-6'>
        You can let other people know your pronouns by {how}, linking your accounts, and pick the sets of pronouns
        you'd like people to use on you. They'll then be able to know how to refer to you as well!
      </p>

      <h3 class='text-xl font-bold mb-2'>Spread the word!</h3>
      <p class='mb-6'>
        This extension is only useful if people use it! The more people use it, the less people will be hesitant or
        do mistakes about your pronouns!
      </p>

      <h3 class='text-xl font-bold mb-2'>Rate the extension</h3>
      <p class='mb-6'>
        Enjoying the extension? You can leave a review on your extension store to let me know you're appreciating
        it. {heart}
      </p>

      <h3 class='text-xl font-bold mb-2'>Feeling generous?</h3>
      <p>
        If you wish, you can <a href={Routes.DONATE} target='_blank' rel='noreferrer' class='link'>donate</a> so I
        can buy enough cookies and coffee to stay alive! Donations help paying for the hosting of the website, which
        isn't free, unlike the extension! 🥰
      </p>
    </main>
  )
}

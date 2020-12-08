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

import { h, Fragment } from 'preact'
import { useTitle } from 'hoofd/preact'
import type { RoutableProps } from 'preact-router'

import style from '@styles/home.scss'
import { Routes } from '@constants'

function Home (_: RoutableProps) {
  return (
    <div className={style.container}>
      <div className={style.title}>Know how to refer to your peers over the Internet</div>
      <div className={style.subtitle}>
        Stop struggling to remember how you should refer to that person. PronounDB makes it easy for people to share
        and lookup each other's pronouns, to avoid the critical mistake of mis-gendering people online.
      </div>
      <div className={style.buttons}>
        <a href={Routes.CHROME_EXT} className={style.button} target='_blank' rel='noreferrer'>
          Get the extension
        </a>
        <a href={Routes.FIREFOX_ADDON} className={style.button} target='_blank' rel='noreferrer'>
          Get the addon
        </a>
      </div>
    </div>
  )
}

Home.displayName = 'Home'
export default Home

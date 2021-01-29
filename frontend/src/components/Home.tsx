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

import { h } from 'preact'
import { useContext } from 'preact/hooks'
import type { RoutableProps } from 'preact-router'

import { Ctx } from './AppContext'
import { Routes } from '@constants'

function Home (_: RoutableProps) {
  const { appState: { count, extVersions } } = useContext(Ctx)

  return (
    <div className='homepage'>
      <div className='title'>Know how to refer to your peers over the Internet</div>
      <div className='subtitle'>
        Stop struggling to remember how you should refer to that person. PronounDB makes it easy for people to share
        and lookup each other's pronouns, to avoid the critical mistake of mis-gendering people online.
      </div>
      <div className='catch'>
        PronounDB supports a <a href={Routes.SUPPORTED}>wide variety of platforms</a>, and integrates smoothly with
        their designs, as if it was always here.
      </div>
      <div className='catch'>
        Join the {count} people sharing their pronouns online! Get the extension:
      </div>
      <div className='extension-links'>
        <div className='extension-link'>
          <a href={Routes.LINK_CHROME} className='link' target='_blank' rel='noreferrer'>
            Get for Chrome
          </a>
          <span>Version {extVersions.chrome}</span>
        </div>
        <div className='extension-link'>
          <a href={Routes.LINK_FIREFOX} className='link' target='_blank' rel='noreferrer'>
            Get for Firefox
          </a>
          <span>Version {extVersions.mozilla}</span>
        </div>
        <div className='extension-link'>
          <a href={Routes.LINK_EDGE} className='link' target='_blank' rel='noreferrer'>
            Get for Edge
          </a>
          <span>Version {extVersions.edge}</span>
        </div>
      </div>
    </div>
  )
}

Home.displayName = 'Home'
export default Home

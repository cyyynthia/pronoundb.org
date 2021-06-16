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
import { h } from 'preact'
import { useTitleTemplate } from 'hoofd/preact'

import { Routes } from '../constants'

import Chrome from 'simple-icons/icons/googlechrome.svg'
import Firefox from 'simple-icons/icons/firefoxbrowser.svg'
import Edge from 'simple-icons/icons/microsoftedge.svg'

export default function Home (_: Attributes) {
  useTitleTemplate('PronounDB')

  return (
    <main className='container-main'>
      <div className='mx-auto m-12'>
        <h1 className='text-center text-3xl font-semibold my-6'>
          Get people's pronouns right, all the time, without struggling
        </h1>
        <p className='text-center text-xl mt-1'>
          Keeping track of everyone's pronouns can be complicated, and unfortunate mistakes can happen.
        </p>
        <p className='text-center text-xl mt-1'>
          PronounDB makes it for you to share your pronouns, so people can use the right ones without even asking.
        </p>
        <p className='text-center text-xl mt-1'>
          It also helps you knowing the pronouns of the people you discuss with.
        </p>
        <p className='text-center text-xl mt-1'>
          It's already helping {window.__USERS_COUNT__} people! Join them now!
        </p>
      </div>
      <div className='flex gap-6 mb-6 font-semibold'>
        <a href={Routes.EXTENSION_CHROME} target='_blank' rel='noreferrer' className='btn-chrome w-1/3'>
          <Chrome className='w-5 h-5 mr-2 fill-current'/>
          <span>Get for Chrome</span>
        </a>
        <a href={Routes.EXTENSION_FIREFOX} target='_blank' rel='noreferrer' className='btn-firefox w-1/3'>
          <Firefox className='w-5 h-5 mr-2 fill-current'/>
          <span>Get for Firefox</span>
        </a>
        <a href={Routes.EXTENSION_EDGE} target='_blank' rel='noreferrer' className='btn-edge w-1/3'>
          <Edge className='w-5 h-5 mr-2 fill-current'/>
          <span>Get for Edge</span>
        </a>
      </div>
      <hr/>
      <div className='flex gap-6 mt-4'>
        <a href='/' className='link'>Get the userscript</a>
      </div>
    </main>
  )
}

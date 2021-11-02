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
import { h } from 'preact'
import { Platforms } from '@pronoundb/shared'
import PlatformIcons from '@pronoundb/shared/PlatformIcons'

import Checkbox from './form/Checkbox'
import Select from './form/Select'
import modules from '../../modules'

export enum ViewState {
  MAIN,
  PRONOUNS,
  SETTINGS
}

export function Unsupported () {
  return (
    <main className='flex-grow p-4 flex flex-col items-center'>
      <p className='font-semibold text-xl text-center m-4 p-4 mt-0 pt-0 border-b border-gray-200'>This website is not supported by PronounDB</p>
    </main>
  )
}

export function Main ({ module }: { module: ExtensionModule }) {
  const platform = Platforms[module.id]

  return (
    <main className='flex-grow border-t-8 border-contextful px-4 py-2' style={{ '--context-color': platform.color, marginTop: -1 }}>
      <div className='flex gap-2 items-center mb-3'>
        {h(PlatformIcons[module.id], { class: 'w-6 h-6' })}
        <h2 className='text-xl font-semibold tracking-wide'>{platform.name}</h2>
      </div>

      <Checkbox label='Enable module'/>
      {/* per-module settings */}
      <p className='text-base'>There are no specific settings for this integration.</p>
    </main>
  )
}

export function Settings () {
  return (
    <main className='flex-grow px-4 py-2'>
      <div className='flex gap-2 items-center mb-2'>
        <h2 className='text-xl font-semibold tracking-wide'>Appearance</h2>
      </div>
      <Select options={[ [ 'lower', 'aaa/aaa' ], [ 'pascal', 'Aaa/Aaa' ] ]}/>

      <div className='flex gap-2 items-center mb-3'>
        <h2 className='text-xl font-semibold tracking-wide'>Enabled modules</h2>
      </div>
      {modules.map((mdl) => (
        <Checkbox
          key={mdl.id}
          label={
            <span className='flex gap-2 items-center'>
              {h(PlatformIcons[mdl.id], { class: 'w-4 h-4' })} {Platforms[mdl.id].name}
            </span>
          }
        />
      ))}
    </main>
  )
}

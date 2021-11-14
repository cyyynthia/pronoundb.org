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

import type { PlatformId } from '@pronoundb/shared'
import type { Attributes, JSX } from 'preact'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'
import { Platforms, PlatformIds } from '@pronoundb/shared'
import PlatformIcons from '@pronoundb/shared/PlatformIcons'

import { Routes } from '../../constants'

import Globe from 'feather-icons/dist/icons/globe.svg'
import { route } from 'preact-router'

const Previews: Record<string, () => JSX.Element> = {}

type SupportedProps = Attributes & { platform?: PlatformId }

type PlatformProps = { platform: PlatformId, className: string }

function Platform ({ platform, className }: PlatformProps) {
  return (
    <div className={`platform-box ${className}`} style={{ borderBottomColor: Platforms[platform].color }}>
      {h(PlatformIcons[platform], { className: 'w-8 h-8 mr-4 flex-none fill-current' })}
      <div className='flex-none flex flex-col'>
        <span className='font-semibold'>{Platforms[platform].name}</span>
        {platform in Previews
          ? <a className='text-dark-blue link' href={Routes.SUPPORTED_PREVIEW(platform)}>See the integration</a>
          : <span>No preview available</span>}
      </div>
    </div>
  )
}

export function SupportedPreview () {
  return (
    <div class='flex gap-6'>
      <Platform platform='twitch' className='w-1/4'/>
      <Platform platform='twitter' className='w-1/4'/>
      <Platform platform='github' className='w-1/4'/>
      <div className='platform-box border-gray-400 dark:border-gray-600 w-1/4'>
        <Globe className='w-8 h-8 mr-4 flex-none fill-current'/>
        <div className='flex-none flex flex-col'>
          <span className='font-semibold'>... and many more!</span>
          <a className='text-dark-blue link' href={Routes.SUPPORTED}>See all supported platforms</a>
        </div>
      </div>
    </div>
  )
}

export default function Supported ({ platform }: SupportedProps) {
  useTitle(platform ? `${Platforms[platform].name} Integration` : 'Supported')

  if (platform) {
    if (!(platform in Previews)) {
      route(Routes.SUPPORTED)
      return null
    }

    return h(Previews[platform], null)
  }

  return (
    <main className='container-main'>
      <div className='title-context'>About PronounDB</div>
      <h2 className='text-2xl font-bold mb-2'>Supported platforms</h2>
      <p className='mb-4'>
        PronounDB aims to support as many platforms as possible, so pronouns can easily be shared and changed
        everywhere by just a few clicks. Here's the full list of platforms supported by PronounDB:
      </p>

      <div className='platforms-grid'>
        {PlatformIds.map((platform) => <Platform key={platform} platform={platform} className='w-full'/>)}
      </div>
    </main>
  )
}

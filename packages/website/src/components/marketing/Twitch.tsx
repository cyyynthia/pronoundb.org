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

import type { PreviewProps } from './Supported'
import { h, Fragment } from 'preact'

import { formatPronounsShort, formatPronouns, formatPronounsLong } from '../../pronouns'

import MessageCircle from 'feather-icons/dist/icons/message-circle.svg'

type ChatLine = { username: string, message: string, pronouns: string }

function TwitchChatLine ({ username, message, pronouns }: ChatLine) {
  return (
    <div className='flex items-center py-1'>
      {pronouns !== 'unspecified' && (
        <div className='flex items-center px-1 text-sm mr-1 bg-gray-300 dark:bg-gray-600 rounded h-5'>
          <span>{formatPronounsShort(pronouns)}</span>
        </div>
      )}
      <div className='font-bold text-pink-dark dark:text-pink'>{username}</div>
      <div>: {message}</div>
    </div>
  )
}

function TwitchChat ({ pronouns }: PreviewProps) {
  return (
    <div className='border bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg w-full'>
      <div className='px-4 py-2 mb-2 font-semibold text-md uppercase border-b border-gray-300 dark:border-gray-600'>Stream chat</div>
      <div className='px-4'>
        <TwitchChatLine username='cyyynthia_' message='Hello!' pronouns={pronouns}/>
        <TwitchChatLine username='cyyynthia_' message='How are you?' pronouns={pronouns}/>
        <TwitchChatLine username='cyyynthia_' message='Amazing, thanks! 🤗' pronouns={pronouns}/>
      </div>
      <div className='p-4 pt-2'>
        <div className='bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-300 py-2 px-4 rounded-md cursor-text select-none'>
          <span>Send a message</span>
        </div>
      </div>
    </div>
  )
}

function TwitchChatPopout ({ pronouns }: PreviewProps) {
  return (
    <div className='border bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg flex gap-4 p-4 w-full'>
      <div className='w-14 h-14 rounded-full overflow-hidden mt-1'>
        <img className='w-full h-full' src='https://cdn.discordapp.com/avatars/94762492923748352/ac68234d445cfa302cd46e02f7805ee4.png?size=1024' alt=''/>
      </div>
      <div>
        <div className='font-semibold text-xl mb-1'>cyyynthia_</div>
        <div className='flex gap-2 items-center'>
          <MessageCircle className='w-6 h-6 flex-none'/>
          <span>{formatPronounsLong(pronouns)}</span>
        </div>
      </div>
    </div>
  )
}

function TwitchChatPreview ({ pronouns }: PreviewProps) {
  return (
    <div className='flex flex-col items-start sm:-mb-4 md:-mb-20 sm:items-center sm:translate-x-5 md:translate-x-0 md:items-end'>
      <div className='w-50 lg:w-96'>
        <TwitchChat pronouns={pronouns}/>
      </div>
      <div className='w-50 lg:w-96 relative my-4 sm:mt-0 sm:bottom-3 sm:-left-10 md:left-auto md:-right-3 md:bottom-1 md:-translate-x-full md:-translate-y-full'>
        <TwitchChatPopout pronouns={pronouns}/>
      </div>
    </div>
  )
}

function TwitchStreamerAbout ({ pronouns }: PreviewProps) {
  return (
    <div className='bg-gray-100 dark:bg-gray-700 p-8'>
      <div className='text-2xl font-bold mb-2'>About cyyynthia_</div>
      <div className='flex gap-1 mb-2 text-gray-700 dark:text-gray-300'>
        <span><b>1337</b> followers</span>
        <span>·</span>
        <span>{formatPronouns(pronouns)}</span>
      </div>
      <p>
        Meow~! Peopwal dwon't take mewn seriouswy 'till nyi bite n scwatch ^w^ nyen pwoceed to purr nya~
      </p>
    </div>
  )
}

export default function Twitch ({ pronouns }: PreviewProps) {
  return (
    <Fragment>
      <section className='flex flex-col lg:flex-row gap-6 mb-6'>
        <div className='flex-1'>
          <h2 className='text-xl font-bold mb-2'>Love hanging out in chat?</h2>
          <p>
            PronounDB shows in the steam chat the pronouns of people who are chatting. Whether you're a viewer or a
            streamer, you can seamlessly know how to refer to people in chat and mention them with accurate pronouns.
          </p>
        </div>
        <TwitchChatPreview pronouns={pronouns}/>
      </section>

      <section>
        <h2 className='text-xl font-bold mb-2'>You're a streamer?</h2>
        <p className='mb-4'>
          Let your viewers know your own pronouns, right in your "About" section. Shown right next to your followers
          count (and team, if you're in one). Easy to find, as it should be.
        </p>
        <TwitchStreamerAbout pronouns={pronouns}/>
      </section>
    </Fragment>
  )
}

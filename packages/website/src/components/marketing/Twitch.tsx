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

import { h, Fragment, Attributes } from 'preact'

import { formatPronounsShort, formatPronouns, formatPronounsLong } from '@pronoundb/shared/format.js'

import { Cynthia } from '../../constants'

import MessageCircle from 'feather-icons/dist/icons/message-circle.svg'

type ChatLine = { username: string, message: string, pronouns: string }

function TwitchChatLine ({ username, message, pronouns }: ChatLine) {
  return (
    <div class='flex items-center py-1'>
      {pronouns !== 'unspecified' && (
        <div class='flex items-center px-1 text-sm mr-1 bg-gray-300 dark:bg-gray-600 rounded h-5'>
          <span>{formatPronounsShort(pronouns)}</span>
        </div>
      )}
      <div class='font-bold text-pink-dark dark:text-pink'>{username}</div>
      <div>: {message}</div>
    </div>
  )
}

function TwitchChat () {
  return (
    <div class='border bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg w-full'>
      <div class='px-4 py-2 mb-2 font-semibold text-md uppercase border-b border-gray-300 dark:border-gray-600'>Stream chat</div>
      <div class='px-4'>
        <TwitchChatLine username={Cynthia.usernames.twitch} message='Hello!' pronouns={Cynthia.pronouns}/>
        <TwitchChatLine username={Cynthia.usernames.twitch} message='How are you?' pronouns={Cynthia.pronouns}/>
        <TwitchChatLine username={Cynthia.usernames.twitch} message='Amazing, thanks! 🤗' pronouns={Cynthia.pronouns}/>
      </div>
      <div class='p-4 pt-2'>
        <div class='bg-gray-300 text-gray-800 dark:bg-gray-600 dark:text-gray-300 py-2 px-4 rounded-md cursor-text select-none'>
          <span>Send a message</span>
        </div>
      </div>
    </div>
  )
}

function TwitchChatPopout () {
  return (
    <div class='border bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 rounded-lg flex gap-4 p-4 w-full'>
      <div class='w-14 h-14 rounded-full overflow-hidden mt-1'>
        <img class='w-full h-full' src={Cynthia.avatar} alt={'Cynthia\'s avatar'}/>
      </div>
      <div>
        <div class='font-semibold text-xl mb-1'>{Cynthia.usernames.twitch}</div>
        <div class='flex gap-2 items-center'>
          <MessageCircle class='w-6 h-6 flex-none'/>
          <span>{formatPronounsLong(Cynthia.pronouns)}</span>
        </div>
      </div>
    </div>
  )
}

function TwitchChatPreview () {
  return (
    <div class='flex flex-col items-start sm:-mb-4 md:-mb-20 sm:items-center sm:translate-x-5 md:translate-x-0 md:items-end'>
      <div class='w-50 lg:w-96'>
        <TwitchChat/>
      </div>
      <div class='w-50 lg:w-96 relative my-4 sm:mt-0 sm:bottom-3 sm:-left-10 md:left-auto md:-right-3 md:bottom-1 md:-translate-x-full md:-translate-y-full'>
        <TwitchChatPopout/>
      </div>
    </div>
  )
}

function TwitchStreamerAbout () {
  return (
    <div class='bg-gray-100 dark:bg-gray-700 p-8'>
      <div class='text-2xl font-bold mb-2'>About {Cynthia.usernames.twitch}</div>
      <div class='flex gap-1 mb-2 text-gray-700 dark:text-gray-300'>
        <span><b>1337</b> followers</span>
        <span>·</span>
        <span>{formatPronouns(Cynthia.pronouns)}</span>
      </div>
      <p>{Cynthia.bio}</p>
    </div>
  )
}

export default function Twitch (_: Attributes) {
  return (
    <Fragment>
      <section class='flex flex-col lg:flex-row gap-6 mb-6'>
        <div class='flex-1'>
          <h2 class='text-xl font-bold mb-2'>Love hanging out in chat?</h2>
          <p>
            PronounDB shows in the steam chat the pronouns of people who are chatting. Whether you're a viewer or a
            streamer, you can seamlessly know how to refer to people in chat and mention them with accurate pronouns.
          </p>
        </div>
        <TwitchChatPreview/>
      </section>

      <section>
        <h2 class='text-xl font-bold mb-2'>You're a streamer?</h2>
        <p class='mb-4'>
          Let your viewers know your own pronouns, right in your "About" section. Shown right next to your followers
          count (and team, if you're in one). Easy to find, as it should be.
        </p>
        <TwitchStreamerAbout/>
      </section>
    </Fragment>
  )
}

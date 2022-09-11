/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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

import { topics } from '../icons/twitter'

import { formatPronouns } from '@pronoundb/shared/format.js'
import { fetchPronouns } from '../utils/fetch'
import { fetchReactProp } from '../utils/react'
import { h, css } from '../utils/dom'

export const match = /^https:\/\/(.+\.)?twitter\.com/

async function injectProfileHeader (username?: string) {
  let header: HTMLElement
  if (username) {
    let currentUsername
    do {
      await new Promise((resolve) => setTimeout(resolve, 10))
      header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
      currentUsername = await fetchReactProp(header.parentElement!, [ { $find: 'user', $in: [ 'return', 'memoizedProps' ] }, 'user', 'screen_name' ])
    } while (currentUsername !== username)
  } else {
    header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
  }

  const node = header.parentElement!
  const id = await fetchReactProp(node, [ { $find: 'user', $in: [ 'return', 'memoizedProps' ] }, 'user', 'id_str' ])
  if (!id) return

  const pronouns = await fetchPronouns('twitter', id)
  if (pronouns === 'unspecified') return

  const prevPronouns = header.querySelector<HTMLElement>('[data-pronoundb]')
  if (prevPronouns) {
    prevPronouns.replaceChild(document.createTextNode(formatPronouns(pronouns)), prevPronouns.childNodes[1])
    return
  }

  const template = header.children[header.children.length - 1]
  header.appendChild(
    h(
      'span',
      { class: template.className, 'data-pronoundb': 'true' },
      topics({ class: template.children[0].getAttribute('class')! }),
      formatPronouns(pronouns)
    )
  )
}

async function injectTweet (tweet: HTMLElement) {
  const directId = await fetchReactProp(tweet.parentElement!, [ { $find: 'tweet', $in: [ 'return', 'memoizedProps' ] }, 'tweet', 'user', 'id_str' ])
  const retweetId = await fetchReactProp(tweet.parentElement!, [ { $find: 'tweet', $in: [ 'return', 'memoizedProps' ] }, 'tweet', 'retweeted_status', 'user', 'id_str' ])

  const pronouns = await fetchPronouns('twitter', retweetId || directId)
  if (pronouns === 'unspecified') return

  let separator: Node
  let sep = tweet.querySelector('[data-testid="User-Names"] div[dir="auto"][aria-hidden="true"]')
  if (!sep) sep = tweet.querySelector<HTMLElement>('time')?.parentElement?.previousElementSibling!

  if (tweet.dataset.testid === 'tweet') {
    const sourceLabel = tweet.querySelector('a[href="https://help.twitter.com/using-twitter/how-to-tweet#source-labels"]')
    if (sourceLabel) sep = sourceLabel.previousElementSibling as HTMLElement
    separator = sep.cloneNode(true)
  } else {
    separator = document.createDocumentFragment()
    separator.appendChild(sep.previousElementSibling!.cloneNode(true))
    separator.appendChild(sep.cloneNode(true))
  }

  let pronounsContainer = sep.parentElement!.querySelector<HTMLElement>('[data-pronoundb]')
  if (!pronounsContainer) {
    const after = <HTMLElement> sep.nextElementSibling?.nextElementSibling
    pronounsContainer = <HTMLElement> sep.cloneNode(true)
    pronounsContainer.setAttribute('data-pronoundb', 'true')
    if (after) {
      sep.parentElement!.insertBefore(separator, after)
      sep.parentElement!.insertBefore(pronounsContainer, after)
      return
    }

    sep.parentElement!.appendChild(separator)
    sep.parentElement!.appendChild(pronounsContainer)
  }

  if (pronounsContainer.tagName === 'SPAN') {
    pronounsContainer.innerText = formatPronouns(pronouns)
  } else {
    pronounsContainer.querySelector('span')!.innerText = formatPronouns(pronouns)
  }
}

async function injectProfilePopOut (popout: HTMLElement) {
  const userInfo = popout.querySelector('a + div')?.parentElement
  const template = userInfo?.querySelector<HTMLElement>('a [dir=ltr]')
  if (!template || !userInfo) return

  const id = await fetchReactProp(popout, [ 'memoizedProps', 'children', '2', 'props', 'children', 'props', 'userId' ])
  if (!id) return

  const pronouns = await fetchPronouns('twitter', id)
  if (pronouns === 'unspecified') return

  const childClass = template.children[0].className
  const parentClass = template.className
  const element = h(
    'span',
    { class: parentClass, 'data-pronoundb': 'true' },
    h(
      'span',
      {
        class: childClass,
        style: css({
          display: 'flex',
          alignItems: 'center',
          marginRight: '4px',
        }),
      },
      topics({
        style: css({
          color: 'inherit',
          fill: 'currentColor',
          width: '1.1em',
          height: '1.1em',
          marginRight: '4px',
        }),
      }),
      formatPronouns(pronouns)
    )
  )

  const prevPronouns = popout.querySelector('[data-pronoundb]')
  if (prevPronouns) prevPronouns.remove()
  userInfo.appendChild(element)
}

function handleMutation (nodes: MutationRecord[]) {
  const layers = document.querySelector<HTMLElement>('#layers')
  if (!layers) return

  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (added instanceof HTMLElement) {
        if (added.tagName === 'META' && added.getAttribute('property') === 'al:android:url' && added.getAttribute('content')?.startsWith('twitter://user?')) {
          const prevPronouns = document.querySelector('[data-testid="UserProfileHeader_Items"] [data-pronoundb]')
          if (prevPronouns) prevPronouns.remove()
          injectProfileHeader(added.getAttribute('content')?.split('=')[1])
          continue
        }

        if (
          added.tagName === 'LINK'
          && added.getAttribute('rel') === 'canonical'
          && document.head.querySelector('meta[property="al:android:url"]')?.getAttribute('content')?.startsWith('twitter://user?')
        ) {
          if (document.querySelector('[data-testid="UserProfileHeader_Items"] [data-pronoundb]')) continue
          injectProfileHeader(added.getAttribute('content')?.split('=')[1])
          continue
        }

        const tweet = added.querySelector<HTMLElement>('[data-testid="tweet"]')
        if (tweet) {
          const prevPronouns = tweet.querySelector('[data-pronoundb]')
          if (prevPronouns) prevPronouns.remove()
          injectTweet(tweet)

          const quoteTweet = tweet.querySelector<HTMLElement>('div[dir="auto"] + div[tabindex="0"]')
          if (quoteTweet && quoteTweet.querySelector('time')) {
            injectTweet(quoteTweet)
          }

          continue
        }

        if (layers.contains(added)) {
          const link = added.querySelector('a[href*="/following"]')
          if (link) injectProfilePopOut(link.parentElement!.parentElement!.parentElement!.parentElement!)
          continue
        }
      }
    }
  }
}

export function inject () {
  const header = document.querySelector('[data-testid="UserProfileHeader_Items"]')
  if (header) injectProfileHeader()

  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

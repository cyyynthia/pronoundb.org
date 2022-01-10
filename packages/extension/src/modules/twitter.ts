/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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
import { fetchPronouns, fetchPronounsBulk } from '../utils/fetch'
import { fetchReactProp, fetchReactPropBulk } from '../utils/react'
import { h, css } from '../utils/dom'
import throttle from '../utils/throttle'

export const match = /^https:\/\/(.+\.)?twitter\.com/

async function injectProfileHeader (header: HTMLElement) {
  const node = header.parentElement!
  const id = await fetchReactProp(node, [ 'return', 'return', 'memoizedProps', 'user', 'id_str' ])
  if (!id) return

  const pronouns = await fetchPronouns('twitter', id)
  if (pronouns === 'unspecified') return

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

async function injectTweets (tweets: HTMLElement[]) {
  tweets = tweets.filter((t) => t.isConnected)
  const parents = tweets.map((t) => t.parentElement!)
  const directIds = await fetchReactPropBulk(parents, [ 'return', 'return', 'return', 'return', 'memoizedProps', 'tweet', 'user', 'id_str' ])
  const retweetIds = await fetchReactPropBulk(parents, [ 'return', 'return', 'return', 'return', 'memoizedProps', 'tweet', 'retweeted_status', 'user', 'id_str' ])
  const ids = tweets.map((_, i) => retweetIds[i] || directIds[i])

  const pronouns = await fetchPronounsBulk('twitter', Array.from(new Set(ids)))
  for (let i = 0; i < tweets.length; i++) {
    const id = ids[i]
    const tweet = tweets[i]

    if (!id || pronouns[id] === 'unspecified') continue

    let sep = tweet.querySelector<HTMLElement>('div + div[aria-hidden="true"]')!
    const sourceLabel = tweet.querySelector('a[href="https://help.twitter.com/using-twitter/how-to-tweet#source-labels"]')
    if (sourceLabel) sep = sourceLabel.previousElementSibling as HTMLElement

    sep.parentElement!.appendChild(sep.cloneNode(true))
    const classes = (sep.nextElementSibling as HTMLElement).classList
    sep.parentElement!.appendChild(h('span', { class: classes, 'data-pronoundb': 'true' }, formatPronouns(pronouns[id])))
  }
}

async function injectProfilePopOut (popout: HTMLElement) {
  if (popout.querySelector('[data-pronoundb]')) return

  const template = popout.querySelector<HTMLElement>('div + div [dir=ltr]')
  if (!template) return

  const id = await fetchReactProp(popout, [ 'memoizedProps', 'children', '3', 'props', 'children', 'props', 'userId' ])
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
  popout.insertBefore(element, popout.children[2])
}

const injectTweet = throttle(injectTweets)

function handleMutation (nodes: MutationRecord[]) {
  const layers = document.querySelector<HTMLElement>('#layers')
  if (!layers) return

  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (added instanceof HTMLElement) {
        if (added.tagName === 'META' && added.getAttribute('property') === 'al:android:url' && added.getAttribute('content')?.startsWith('twitter://user?')) {
          const header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
          const prevPronouns = header.querySelector('[data-pronoundb]')
          if (prevPronouns) prevPronouns.remove()
          injectProfileHeader(header)
          continue
        }

        if (
          added.tagName === 'LINK'
          && added.getAttribute('rel') === 'canonical'
          && document.head.querySelector('meta[property="al:android:url"]')?.getAttribute('content')?.startsWith('twitter://user?')
        ) {
          const header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
          if (header.querySelector('[data-pronoundb]')) continue
          injectProfileHeader(header)
          continue
        }

        const tweet = added.querySelector<HTMLElement>('[data-testid="tweet"]')
        if (tweet) {
          const prevPronouns = tweet.querySelector('[data-pronoundb]')
          if (prevPronouns) prevPronouns.remove()
          injectTweet(tweet)
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
  const header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')
  if (header) injectProfileHeader(header)

  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

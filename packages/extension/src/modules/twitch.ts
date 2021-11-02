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

import { whisper } from '../icons/twitch'

import { __fetchPronouns as fetchPronouns } from '../utils/fetch'
import { fetchReactProp } from '../utils/react'
import { formatPronouns, formatPronounsShort, formatPronounsLong } from '../utils/pronouns'
import { h, css } from '../utils/dom'

export const match = /^https:\/\/(.+\.)?twitch\.tv/

const settings = {
  chat: true,
  popout: true,
  streamer: true,
  chatStyle: 'badge'
}

const usersCache = Object.create(null)
async function injectChat (element: HTMLElement) {
  const username = element.dataset.aUser
  if (!username) return
  if (!(username in usersCache)) {
    usersCache[username] = await fetchReactProp(element, [ 'return', 'key' ]).then((s) => s.split('-')[0])
  }

  const pronouns = await fetchPronouns('twitch', usersCache[username])
  if (!pronouns || pronouns === 'unspecified') return

  if (settings.chatStyle === 'badge') {
    const badgesContainer = element.parentElement?.parentElement?.parentElement?.firstChild
    if (!badgesContainer) return

    badgesContainer.insertBefore(
      h(
        'span',
        {
          style: css({
            display: 'inline-block',
            borderRadius: 'var(--border-radius-medium)',
            backgroundColor: 'var(--color-background-button-secondary-default)',
            color: 'var(--color-text-button-secondary)',
            lineHeight: '1.8rem',
            position: 'relative',
            bottom: '-1px',
            marginRight: '4px',
            padding: '0 2px'
          })
        },
        formatPronounsShort(pronouns)
      ),
      badgesContainer.firstChild!
    )

    return
  }

  element.parentElement?.appendChild(
    h('span', { style: (element.getAttribute('style') || '') + css({ opacity: '0.7' }) }, ` (${formatPronounsShort(pronouns)})`)
  )

  setTimeout(() => {
    if (!document.querySelector('.chat-paused-footer')) {
      const scroller = document.querySelector('[data-a-target="chat-scroller"] .simplebar-scroll-content')
      scroller?.scrollTo(0, scroller.scrollHeight)
    }
  }, 5)
}

async function injectViewerCard (element: HTMLElement) {
  let placeholder
  for (let i = 0; i < 100; i++) {
    placeholder = element.querySelector('.tw-placeholder')
    if (!placeholder) break

    await new Promise((resolve) => setTimeout(resolve, 10))
  }

  if (placeholder) return

  const card = element.querySelector<HTMLElement>('.viewer-card')
  if (!card) return

  const container = element.querySelector<HTMLElement>('.viewer-card-header__display-name')
  if (!container) return

  const cardId = await fetchReactProp(card, [ 'child', 'sibling', 'child', 'memoizedProps', 'targetUser', 'id' ])
  const pronouns = await fetchPronouns('twitch', cardId)
  if (!pronouns || pronouns === 'unspecified') return

  container.appendChild(
    h(
      'div',
      { style: css({ display: 'flex', color: 'var(--color-text-overlay)' }) },
      whisper({ fill: 'var(--color-fill-current)' }),
      h(
        'p',
        {
          style: css({
            marginLeft: '0.5rem',
            marginTop: 'auto',
            color: 'var(--color-text-overlay)',
            fontSize: 'var(--font-size-6)'
          })
        },
        formatPronounsLong(pronouns)
      )
    )
  )
}

async function injectStreamerAbout () {
  let streamerId
  const player = document.querySelector<HTMLElement>('.video-player')
  if (player) {
    streamerId = await fetchReactProp(player, [ 'return', 'return', 'return', 'return', 'return', 'return', 'return', 'return', 'memoizedProps', 'channelID', 'user', 'id' ])
  } else {
    const channelInfo = document.querySelector<HTMLElement>('.channel-info-content')
    if (!channelInfo) return

    streamerId = await fetchReactProp(channelInfo, [ 'child', 'memoizedProps', 'channelID' ])
  }

  const pronouns = await fetchPronouns('twitch', streamerId)
  if (!pronouns || pronouns === 'unspecified') return

  const el = document.querySelector('.about-section div + div span div')
  if (!el) return

  el.appendChild(
    h('div', {
      style: css({
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        fontSize: 'var(--font-size-5)',
        lineHeight: 'var(--line-height-heading)',
        fontWeight: 'var(--font-weight-semibold)'
      })
    }, '·')
  )

  el.appendChild(h('div', {}, formatPronouns(pronouns)))
}

function handleMutation (nodes: MutationRecord[]) {
  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (added instanceof HTMLElement) {
        if (settings.chat) {
          const el = added.querySelector<HTMLElement>('.chat-author__display-name')
          if (added.classList?.contains('chat-line__message') && el) {
            injectChat(el)
            continue
          }
        }

        if (settings.popout && added.dataset.aTarget === 'viewer-card-positioner') {
          injectViewerCard(added)
          continue
        }

        if (settings.streamer && added.querySelector('.about-section')) {
          injectStreamerAbout()
          continue
        }
      }
    }
  }
}

export async function inject () {
  // todo: load settings
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

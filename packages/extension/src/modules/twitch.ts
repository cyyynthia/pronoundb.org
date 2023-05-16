/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
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

import { whisper } from '../icons/twitch'

import { formatPronouns, formatPronounsShort, formatPronounsLong } from '../utils/pronouns'
import { fetchPronouns } from '../utils/fetch'
import { fetchReactProp } from '../utils/proxy'
import { h, css } from '../utils/dom'
import { LRUMap } from '../utils/lru/lru'

export const name = 'Twitch'
export const color = '#9146FF'
export const match = /^https:\/\/(.+\.)?twitch\.tv/
export { default as Icon } from 'simple-icons/icons/twitch.svg'

const settings = {
  chat: true,
  popout: true,
  streamer: true,
  chatStyle: 'badge',
}

function createBadge (pronouns: string) {
  return h(
    'span',
    {
      style: css({
        display: 'inline-block',
        borderRadius: 'var(--border-radius-medium)',
        backgroundColor: 'var(--color-background-button-secondary-default)',
        color: 'var(--color-text-button-secondary)',
        lineHeight: '1.8rem',
        padding: '0 2px',
      }),
    },
    formatPronounsShort(pronouns)
  )
}

const usersCache = Object.create(null)
async function injectChat (element: HTMLElement) {
  const isFFZ = !element.dataset.aUser

  let userId
  if (isFFZ) {
    let grandparent = element.parentElement?.parentElement
    userId = grandparent?.dataset.userId || grandparent?.parentElement?.dataset.userId
  } else {
    const username = element.dataset.aUser
    if (!username) return
    if (!(username in usersCache)) {
      userId = await fetchReactProp(element, [ 'return', 'key' ]).then((s: string) => s.split('-')[0])
      if (!userId) return

      usersCache[username] = userId
    } else {
      userId = usersCache[username]
    }
  }

  const pronouns = await fetchPronouns('twitch', userId)
  if (pronouns === 'unspecified') return

  if (settings.chatStyle === 'badge') {
    const badgesContainer = isFFZ
      ? element.parentElement?.parentElement?.querySelector('.chat-line__message--badges')
      : element.parentElement?.parentElement?.parentElement?.firstChild
    if (!badgesContainer) return

    badgesContainer.insertBefore(
      h(
        'div',
        {
          class: 'pronoundb-chat-badge',
          style: css({ display: 'inline', position: 'relative', bottom: '-1px', marginRight: '4px' }),
        },
        createBadge(pronouns)
      ),
      badgesContainer.firstChild!
    )
  } else {
    element.parentElement?.appendChild(
      h(
        'span',
        {
          class: 'pronoundb-chat-inline',
          style: (element.getAttribute('style') || '') + css({ opacity: '0.7' }),
        },
        ` (${formatPronounsShort(pronouns)})`
      )
    )
  }

  if (!document.querySelector('.chat-paused-footer')) {
    const scroller = document.querySelector('[data-a-target="chat-scroller"] .simplebar-scroll-content')
    scroller?.scrollTo(0, scroller.scrollHeight)
  }
}

const msgUserMap = new LRUMap<string, string>(500)
async function inject7tvChat (message: HTMLElement) {
  const messageId = message.getAttribute('msg-id')
  if (!messageId) return

  let userId = msgUserMap.get(messageId)
  for (let i = 0; i < 10 && !userId; i++) {
    // Sometimes the IDs are a bit slow to arrive...
    // We wait for them for up to 100 ms.
    await new Promise((r) => setTimeout(r, 10))
    userId = msgUserMap.get(messageId)
  }

  if (!userId) return
  const pronouns = await fetchPronouns('twitch', userId)
  if (pronouns === 'unspecified') return

  const user = message.querySelector<HTMLElement>('.seventv-chat-user')
  if (!user) return

  if (settings.chatStyle === 'badge') {
    user.insertBefore(
      h(
        'div',
        {
          class: 'pronoundb-chat-badge',
          style: css({ display: 'inline', position: 'relative', bottom: '-1px', marginRight: '4px' }),
        },
        createBadge(pronouns)
      ),
      user.firstChild!
    )
  } else {
    user.appendChild(
      h(
        'span',
        {
          class: 'pronoundb-chat-inline',
          style: css({ opacity: '0.7' }),
        },
        ` (${formatPronounsShort(pronouns)})`
      )
    )
  }
}

async function injectWhisperHeader (header: HTMLElement) {
  const container = header.parentElement?.parentElement?.parentElement
  if (!container) return

  if (!container.dataset.interlocutorId) {
    container.dataset.interlocutorId = await fetchReactProp(header, [ { $find: 'interlocutor', $in: [ 'return', 'memoizedProps' ] }, 'interlocutor', 'id' ])
  }

  let pronouns = await fetchPronouns('twitch', container.dataset.interlocutorId!)
  if (pronouns === 'unspecified') return

  const username = header.querySelector('span')
  username!.parentElement!.appendChild(
    h('div', { class: 'pronoundb-whisper-header', style: css({ marginLeft: '4px' }) }, createBadge(pronouns))
  )
}

async function injectViewerCard (element: HTMLElement) {
  const container = element.querySelector<HTMLElement>('.viewer-card-header__display-name')
  if (!container) return

  const query = { $find: 'targetUser', $in: [ 'child', 'sibling', 'memoizedProps', '0', '1' ] }
  const cardId = await fetchReactProp(element, [ query, 'targetUser', 'id' ])
  if (!cardId) return

  const pronouns = await fetchPronouns('twitch', cardId)
  if (pronouns === 'unspecified') return

  container.appendChild(
    h(
      'div',
      {
        class: 'pronoundb-viewer-card',
        style: css({ display: 'flex', color: 'var(--color-text-overlay)' }),
      },
      whisper({ fill: 'var(--color-fill-current)' }),
      h(
        'p',
        {
          style: css({
            marginLeft: '0.5rem',
            marginTop: 'auto',
            color: 'var(--color-text-overlay)',
            fontSize: 'var(--font-size-6)',
          }),
        },
        formatPronounsLong(pronouns)
      )
    )
  )
}

async function injectStreamerAbout () {
  const channelInfo = document.querySelector<HTMLElement>('.channel-info-content')
  if (!channelInfo) return

  const streamerId = await fetchReactProp(channelInfo, [ { $find: 'channelID', $in: [ 'child', 'memoizedProps' ] }, 'channelID' ])
  if (!streamerId) return

  const pronouns = await fetchPronouns('twitch', streamerId)
  if (pronouns === 'unspecified') return

  const el = document.querySelector('.about-section div + div span div')
  if (!el) return

  const prevPronounsContainer = el.querySelector<HTMLElement>('.pronoundb-streamer-about div')
  if (prevPronounsContainer) {
    prevPronounsContainer.innerText = formatPronouns(pronouns)
    return
  }

  el.appendChild(
    h('div', {
      class: 'pronoundb-streamer-about',
      style: css({
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        fontSize: 'var(--font-size-5)',
        lineHeight: 'var(--line-height-heading)',
        fontWeight: 'var(--font-weight-semibold)',
      }),
    }, '·')
  )

  el.appendChild(h('div', {}, formatPronouns(pronouns)))
}

function bind7tvCompat () {
  window.postMessage({ source: 'pronoundb', payload: { action: 'ttv.inject-chat' } })
  window.addEventListener('message', (e) => {
    if (e.source === window && e.data?.source === 'pronoundb') {
      const data = e.data.payload
      if (data.action === 'ttv.chat.msg') {
        msgUserMap.set(data.id, data.user)
      }
    }
  })
}

function handleMutation (nodes: MutationRecord[]) {
  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (added instanceof HTMLElement) {
        if (settings.chat) {
          const displayName = added.querySelector<HTMLElement>('.chat-author__display-name')
          // Chat message
          if ((added.className.includes('chat-line__') || added.classList.contains('user-notice-line')) && displayName) {
            injectChat(displayName)
            continue
          }

          // Thread view
          if (added.children?.item(1)?.classList.contains('chat-replies-list__container')) {
            added.querySelectorAll<HTMLElement>('.chat-author__display-name').forEach((el) => injectChat(el))
            continue
          }

          // 7TV compat, cuz why respect Twitch semantics :D
          if (added.className === 'seventv-message') {
            const userMessage = added.querySelector<HTMLElement>('.seventv-user-message')
            if (userMessage) inject7tvChat(userMessage)
            continue
          }

          if (added.classList.contains('seventv-user-message')) {
            inject7tvChat(added)
            continue
          }

          if (added.classList.contains('seventv-chat-scroller')) {
            bind7tvCompat()
            continue
          }
        }

        // if (added.className.includes('tw-dialog-layer') && added.querySelector('.whispers-list-item')) {
        //   console.log('whispers list', added)
        //   continue
        // }

        if (added.dataset.aTarget === 'thread-header__click-area') {
          injectWhisperHeader(added)
          continue
        }

        /* Unnecessary imho, here for reference
        if (added.dataset.aTarget === 'whisper-message') {
          console.log('whispers message', added)
          continue
        }

        if (added.className === 'simplebar-scroll-content' && added.querySelector('[data-a-target="whisper-message"]')) {
          const msgs = added.querySelectorAll('[data-a-target="whisper-message"]')
          for (let i = 0; i < msgs.length; i++) {
            console.log('whispers message', msgs[i])
          }
          continue
        }
        */

        const viewerCard = added.firstElementChild as HTMLElement
        if (settings.popout && viewerCard?.dataset.aTarget === 'viewer-card') {
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

export function inject () {
  // todo: load settings

  const navbar = document.querySelector<HTMLElement>('[data-a-target="top-nav-container"]')!
  if (navbar) {
    fetchReactProp(navbar, [ { $find: 'user', $in: [ 'return', 'memoizedProps' ] }, 'user' ])
      .then((data: any) => {
        document.body.dataset.currentUserId = data.id
        document.body.dataset.currentUserDn = data.displayName
      })
  }

  // Process all existing elements
  document.querySelectorAll<HTMLElement>('.chat-author__display-name').forEach((el) => injectChat(el))
  if (document.querySelector('.about-section')) injectStreamerAbout()

  // Start observer
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

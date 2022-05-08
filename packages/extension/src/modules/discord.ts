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

import { formatPronouns } from '@pronoundb/shared/format.js'
import { fetchPronouns } from '../utils/fetch'
import { fetchReactProp } from '../utils/react'
import { h, css } from '../utils/dom'

export const match = /^https:\/\/(.+\.)?discord\.com\/(channels|activity|login|app|library|store)/

const Styles = {
  header: css({
    fontFamily: 'var(--font-display)',
    fontSize: '12px',
    fontWeight: '700',
    lineHeight: '16px',
    color: 'var(--header-secondary)',
    textTransform: 'uppercase',
    marginBottom: '8px',
  }),
  text: css({
    fontSize: '14px',
    lineHeight: '18px',
    fontWeight: '400',
    color: 'var(--text-normal)',
    marginBottom: '8px',
  }),
}

async function handleMessage (node: HTMLElement) {
  const id = await fetchReactProp(node, [ 'return', 'return', 'memoizedProps', 'message', 'author', 'id' ])
  if (!id) return

  const pronouns = await fetchPronouns('discord', id)
  if (pronouns === 'unspecified') return

  const header = node.querySelector('h2')
  if (!header) return

  header.appendChild(
    h(
      'span',
      {
        class: 'pronoundb-pronouns',
        style: css({
          color: 'var(--text-muted)',
          fontSize: '.75rem',
          lineHeight: '1.375rem',
          fontWeight: '500',
        }),
      },
      ` • ${formatPronouns(pronouns)}`
    )
  )
}

async function handleUserPopOut (node: HTMLElement) {
  const id = await fetchReactProp(node, [ { $find: 'userId', $in: [ 'child', 'memoizedProps' ] }, 'userId' ])
  if (!id) return

  const pronouns = await fetchPronouns('discord', id)
  if (pronouns === 'unspecified') return

  const frag = document.createDocumentFragment()
  frag.appendChild(h('div', { style: Styles.header }, 'Pronouns'))
  frag.appendChild(h('div', { style: Styles.text }, formatPronouns(pronouns)))
  node.querySelector('[class^="bodyInnerWrapper"]')?.appendChild(frag)

  setTimeout(() => {
    const { y, height } = node.getBoundingClientRect()
    const bottom = window.innerHeight - y - height - 16
    if (bottom < 0) node.style.top = `${parseInt(node.style.top, 10) + bottom}px`
  }, 5)
}

async function handleUserModal (node: HTMLElement) {
  const id = await fetchReactProp(node, [ 'child', 'memoizedProps', 'user', 'id' ])
  if (!id) return

  const pronouns = await fetchPronouns('discord', id)
  if (pronouns === 'unspecified') return

  const container = node.querySelector<HTMLElement>('[class^="userInfoSection"]')
  if (!container) return

  const frag = document.createDocumentFragment()
  frag.appendChild(h('div', { class: 'userInfoSectionHeader-owo', style: Styles.header }, 'Pronouns'))
  frag.appendChild(h('div', { style: Styles.text }, formatPronouns(pronouns)))

  container.classList.add('has-pronouns')
  container.appendChild(frag)
}

async function handleAutocompleteRow (row: HTMLElement) {
  if (row.querySelector('.pronoundb-autocomplete-pronouns')) return

  const id = await fetchReactProp(row, [ 'return', 'return', 'return', 'return', 'key' ])
  if (!id) return

  const pronouns = await fetchPronouns('discord', id)
  if (pronouns === 'unspecified') return

  const tag = row.querySelector('[class*="autocompleteRowContentSecondary-"]')
  if (!tag) return

  const element = document.createElement('span')
  element.className = 'pronoundb-autocomplete-pronouns'
  element.innerText = ` • ${formatPronouns(pronouns)}`
  tag.appendChild(element)
}

function handleMutation (mutations: MutationRecord[]) {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node instanceof HTMLElement) {
        if (node.id.startsWith('chat-messages-')) {
          handleMessage(node)
          continue
        }

        if (node.className.startsWith('chat-')) {
          console.log(node.querySelectorAll('li[id^=chat-messages-]'))
          node.querySelectorAll<HTMLElement>('li[id^=chat-messages-]').forEach((m) => handleMessage(m))
          continue
        }

        if (node.id.startsWith('popout_') && node.querySelector('div[role="dialog"][class^="userPopout-"]')) {
          handleUserPopOut(node)
          continue
        }

        if (node.querySelector('div[class^="userInfoSection-"]')) {
          if (node.querySelector('[aria-modal="true"]')) {
            handleUserModal(node)
            continue
          }

          const modal = node.parentElement?.parentElement?.parentElement?.parentElement
          if (modal) handleUserModal(modal)
          continue
        }

        if (node.className.startsWith('autocomplete-')) {
          const rows = Array.from(node.querySelectorAll('[class*="autocompleteRow-"]')) as HTMLElement[]
          rows.filter((row) => row?.querySelector('[role="img"]')).forEach((row) => handleAutocompleteRow(row))
          continue
        }

        if (node.className.startsWith('autocompleteRow') && node.querySelector('[role="img"]')) {
          handleAutocompleteRow(node)
          continue
        }
      }
    }
  }
}

export function inject () {
  // Process messages already loaded
  document.querySelectorAll<HTMLElement>('li[id^=chat-messages-]').forEach((m) => handleMessage(m))

  // Mutation observer
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })

  const style = document.createElement('style')
  style.textContent += '[class^="headerText-"] + .pronoundb-pronouns { margin-right: .6rem; }'
  style.textContent += '[class^="userInfoSection-"] [class^="userInfoSectionHeader-"] { grid-row: 1; }'
  style.textContent += '[class^="userInfoSection-"] [class^="note-"]:last-child { grid-column: 1 / 3; }'
  style.textContent += '[class^="userBio-"] { grid-row: 2; }'
  style.textContent += '[class^="userBio-"] + [class^="userInfoSectionHeader-"] { grid-row: 3; grid-column: 1 / 3; }'
  style.textContent += '[class^="userBio-"] ~ [class^="note-"] { grid-row: 4; grid-column: 1 / 3; }'
  document.head.appendChild(style)
}

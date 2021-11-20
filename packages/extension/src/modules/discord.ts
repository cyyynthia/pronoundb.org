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

import { formatPronouns } from '@pronoundb/shared/format.js'
import { fetchPronouns, fetchPronounsBulk } from '../utils/fetch'
import { fetchReactProp, fetchReactPropBulk } from '../utils/react'
import { h, css } from '../utils/dom'
import throttle from '../utils/throttle'

export const match = /^https:\/\/(.+\.)?discord\.com\/(channels|activity|login|app|library|store)/

const Styles = {
  header: css({
    fontFamily: 'var(--font-display)',
    fontSize: '12px',
    fontWeight: '700',
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
  })
}

async function handleMessages (nodes: HTMLElement[]) {
  nodes = nodes.filter((node) => node.isConnected)
  const ids = await fetchReactPropBulk(nodes, [ 'return', 'return', 'memoizedProps', 'message', 'author', 'id' ])
  const pronounsMap = await fetchPronounsBulk('discord', Array.from(new Set(ids)))

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const id = ids[i]
    const pronouns = pronounsMap[id]
    if (pronouns === 'unspecified') continue

    const header = node.querySelector('h2')
    if (!header) continue

    header.appendChild(
      h(
        'span',
        {
          class: 'pronoundb-pronouns',
          style: css({
            color: 'var(--text-muted)',
            fontSize: '.9rem',
          }),
        },
        ` • ${formatPronouns(pronouns)}`
      )
    )
  }
}

async function handleUserPopOut (node: HTMLElement) {
  const id = await fetchReactProp(node, [ 'child', 'child', 'child', 'child', 'child', 'memoizedProps', 'userId' ])
  const pronouns = await fetchPronouns('discord', id)
  if (pronouns === 'unspecified') return

  const frag = document.createDocumentFragment()
  frag.appendChild(h('div', { style: Styles.header }, 'Pronouns'))
  frag.appendChild(h('div', { style: Styles.text }, formatPronouns(pronouns)))
  node.querySelector('[class^="bodyInnerWrapper"]')?.appendChild(frag)

  setTimeout(() => {
    const { y, height } = node.getBoundingClientRect()
    const bottom = window.innerHeight - y - height - 16
    if (bottom < 0) node.style.top = `${parseInt(node.style.top) + bottom}px`
  }, 5)
}

async function handleUserModal (node: HTMLElement) {
  console.log('modal', node)
  const id = await fetchReactProp(node, [ 'child', 'memoizedProps', 'user', 'id' ])
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

async function handleAutocompleteRows (rows: HTMLElement[]) {
  rows = rows.filter((row) => row.isConnected)
  const ids = await fetchReactPropBulk(rows, [ 'return', 'return', 'return', 'return', 'key' ])
  const pronounsMap = await fetchPronounsBulk('discord', Array.from(new Set(ids)))

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.querySelector('.pronoundb-autocomplete-pronouns')) continue

    const id = ids[i]
    if (!id) continue

    const pronouns = pronounsMap[id]
    if (pronouns === 'unspecified') continue

    const tag = row.querySelector('[class*="autocompleteRowContentSecondary-"]')
    if (!tag) return

    const element = document.createElement('span')
    element.className = 'pronoundb-autocomplete-pronouns'
    element.innerText = ` • ${formatPronouns(pronouns)}`
    tag.appendChild(element)
  }
}

// Bulk process stuff
const handleMessage = throttle(handleMessages)
const handleAutocompleteRow = throttle(handleAutocompleteRows)

function handleMutation (mutations: MutationRecord[]) {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node instanceof HTMLElement) {
        console.log(node)
        if (node.id.startsWith('chat-messages-')) {
          handleMessage(node)
          continue
        }

        if (node.className.startsWith('chatContent-')) {
          handleMessages(Array.from(node.querySelectorAll('div[class^="message-"]')) as HTMLElement[])
          continue
        }

        if (node.id.startsWith('popout_') && node.querySelector('div[role="dialog"][class^="userPopout-"]')) {
          handleUserPopOut(node)
          continue
        }

        if (node.querySelector('[aria-modal="true"]') && node.querySelector('div[class^="userInfoSection-"]')) {
          handleUserModal(node)
          continue
        }

        if (node.className.startsWith('autocomplete-')) {
          const rows = Array.from(node.querySelectorAll('[class*="autocompleteRow-"]')) as HTMLElement[]
          handleAutocompleteRows(rows.filter((node) => node?.querySelector('[role="img"]')))
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
  handleMessages(Array.from(document.querySelectorAll('[id^=chat-messages-]')) as HTMLElement[])

  // Mutation observer
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })

  const style = document.createElement('style')
  style.textContent += '[class^="headerText-"] + .pronoundb-pronouns { margin-right: .6rem; }'
  style.textContent += '[class^="userInfoSection-"] { display: grid; grid-template-columns: 3fr 1fr; grid-column-gap: 16px; }'
  style.textContent += '[class^="userInfoSection-"] [class^="userInfoSectionHeader-"] { grid-row: 1; }'
  style.textContent += '[class^="userInfoSection-"] [class^="note-"]:last-child { grid-column: 1 / 3; }'
  style.textContent += '[class^="userBio-"] { grid-row: 2; }'
  style.textContent += '[class^="userBio-"] + [class^="userInfoSectionHeader-"] { grid-row: 3; grid-column: 1 / 3; }'
  style.textContent += '[class^="userBio-"] ~ [class^="note-"] { grid-row: 4; grid-column: 1 / 3; }'
  document.head.appendChild(style)
}

/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
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

import { h, css } from '../util/dom'
import { connect, invoke } from '../util/bridge'
import { fetchPronouns } from '../util/fetch'
import { PronounsShort } from '../shared.ts'

function fetchIdForUsername (username) {
  const node = document.querySelector(`.chat-line__message [data-a-user="${username}"]`)
  if (!node) return null

  const line = node.parentElement.parentElement
  const reactKey = Object.keys(line).find(k => k.startsWith('__reactInternalInstance'))
  return line[reactKey].pendingProps.children.props.userData.userID
}

function isPaused () {
  return Boolean(document.querySelector('.chat-room .chat-paused-footer'))
}

function doScrollToBottom () {
  const node = document.querySelector('.chat-room .chat-list--default > div')
  const reactKey = Object.keys(node).find(k => k.startsWith('__reactInternalInstance'))
  node[reactKey].memoizedProps.children[1]._owner.stateNode.scrollRef.scrollToBottom()
}

const cache = {}
async function getIdForUsername (username) {
  if (!cache[username]) cache[username] = await invoke(fetchIdForUsername, username)
  return cache[username]
}

function makeChatBadge (pronouns) {
  // todo: tooltip
  const style = css({
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

  return h('span', { class: 'pronoundb-pronouns', style }, PronounsShort[pronouns])
}

async function handleChatLine (line) {
  const username = line.querySelector('.chat-author__display-name').innerText.toLowerCase()
  const id = await getIdForUsername(username)
  const pronouns = await fetchPronouns('twitch', id, true)

  const wasPaused = isPaused()
  if (pronouns && !line.querySelector('.pronoundb-pronouns')) {
    const username = line.querySelector('.chat-line__username-container')
    username.parentNode.insertBefore(makeChatBadge(pronouns), username)
  }

  if (!wasPaused) setTimeout(() => invoke(doScrollToBottom), 10)
}

function handleMutation (nodes) {
  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (added.classList?.contains('chat-line__message') && added.querySelector('.chat-author__display-name')) {
        handleChatLine(added)
      }
    }
  }
}

export function run () {
  connect()
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

export const match = /^https:\/\/(.+\.)?twitch\.tv/

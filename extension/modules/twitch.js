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

import { fetchPronouns } from '../fetch'
import { h, css } from '../util'

function makeChatBadge (pronouns) {
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

  return h('span', { style }, pronouns)
}

async function injectChatLine (line) {
  const reactKey = Object.keys(line).find(k => k.startsWith('__reactInternalInstance'))
  const pronouns = await fetchPronouns('twitch', line[reactKey].return.memoizedProps.message.user.userID)
  if (pronouns) {
    const username = line.querySelector('.chat-line__username-container')
    username.parentNode.insertBefore(makeChatBadge(pronouns), username)
  }
}

function handleMutation (nodes) {
  for (const { target, addedNodes } of nodes) {
    if (target.classList?.contains('chat-scrollable-area__message-container')) {
      for (const added of addedNodes) {
        if (added.classList?.contains('chat-line__message')) {
          injectChatLine(added)
        }
      }
    }
  }
}

function inject () {
  // todo: consider injecting in the React component for chat lines rather than relying on a MO
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

if (/(^|\.)twitch\.tv$/.test(location.hostname)) {
  inject()
}

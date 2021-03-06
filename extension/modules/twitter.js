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

import { h, css } from '../util/dom.js'
import { fetchPronouns } from '../util/fetch.js'
import { fetchReactProp } from '../util/react.js'
import { formatPronouns } from '../util/format.js'
import { topics } from '../icons/twitter.js'

async function injectProfileHeader (header) {
  const node = header.parentElement.parentElement.parentElement
  const id = await fetchReactProp(node, [ 'return', 'return', 'pendingProps', 'scribeData', 'profile_id' ])
  if (!id) return

  const pronouns = await fetchPronouns('twitter', id)
  if (pronouns) {
    const template = header.children[header.children.length - 1]
    header.appendChild(
      h(
        'span',
        { class: template.className, 'data-pronoundb': 'true' },
        topics({ class: template.children[0].getAttribute('class') }),
        formatPronouns(pronouns)
      )
    )
  }
}

async function injectProfilePopOut (popout) {
  const id = await fetchReactProp(popout, [ 'memoizedProps', 'children', 3, 'props', 'children', 'props', 'userId' ])
  if (!id) return

  const pronouns = await fetchPronouns('twitter', id)
  if (pronouns) {
    if (popout.querySelector('[data-pronoundb]')) return
    const template = popout.querySelector('div + div [dir=ltr]')
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
            marginRight: '4px'
          })
        },
        topics({
          style: css({
            color: 'inherit',
            fill: 'currentColor',
            width: '1.1em',
            height: '1.1em',
            marginRight: '4px'
          })
        }),
        formatPronouns(pronouns)
      )
    )
    popout.insertBefore(element, popout.children[2])
  }
}

function handleMutation (nodes) {
  const layers = document.querySelector('#layers')
  if (!layers) return

  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (layers.contains(added)) {
        const link = added.querySelector('a[href*="/following"]')
        if (link) {
          injectProfilePopOut(link.parentElement.parentElement.parentElement.parentElement)
        }
      } else {
        if (added.getAttribute?.('property') === 'al:android:url' && added.content.startsWith('twitter://user?')) {
          const prevPronouns = document.querySelector('[data-pronoundb]')
          if (prevPronouns) prevPronouns.remove()
          injectProfileHeader(document.querySelector('[data-testid="UserProfileHeader_Items"]'))
        }
      }
    }
  }
}

export function run () {
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

export const match = /^https:\/\/(.+\.)?twitter\.com/

/*
 * Copyright (c) Endercheif, All rights reserved.
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

import { formatPronouns } from '../utils/pronouns'
import { fetchPronouns } from '../utils/fetch'
import { css, h } from '../utils/dom'

export const name = 'Reddit'
export const color = '#FF7500'
export const match = /^https:\/\/(.+\.)?reddit.com\/(.+)?/

export { default as Icon } from 'simple-icons/icons/reddit.svg'

async function injectUserProfile (username: string) {
  const usernameArea
    = document.querySelector<HTMLHeadingElement>('.titlebox>h1')
  if (usernameArea) await injectOldRedditProfile(username, usernameArea)

  const karmaCount = document.querySelector<HTMLSpanElement>(
    'div > h5+div:last-child > i.icon+span'
  )
  if (karmaCount) await injectNewRedditProfile(
    username,
      karmaCount.parentElement!.parentElement! as HTMLDivElement
  )
}

async function injectOldRedditProfile (
  username: string,
  usernameArea: HTMLHeadingElement
) {
  const pronouns = await fetchPronouns('reddit', username)
  if (pronouns === 'unspecified') return

  // eslint-disable-next-line require-atomic-updates
  usernameArea.style.marginBottom = '0'
  const el = h(
    'p',
    { style: css({ 'margin-bottom': '5px', color: 'gray' }) },
    formatPronouns(pronouns)
  )

  usernameArea.after(el)
}

async function injectNewRedditProfile (username: string, box: HTMLDivElement) {
  const pronouns = await fetchPronouns('reddit', username)
  if (pronouns === 'unspecified') return

  const copy = box.cloneNode(true) as HTMLDivElement

  const [ title, content ] = copy.children as unknown as [
    HTMLHeadingElement,
    HTMLDivElement
  ]

  title.innerText = 'Pronouns'

  const [ icon, text ] = content as unknown as [HTMLElement, HTMLSpanElement]
  icon.classList.add('icon-pronouns')
  text.innerText = formatPronouns(pronouns)

  box.after(copy)
}

export function inject () {
  const path = location.pathname.split('/').filter((v) => v)


  if (path[0] === 'user') injectUserProfile(path[1])
}

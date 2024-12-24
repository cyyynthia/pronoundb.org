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

import { css, h } from '../../utils/dom'
import { fetchPronouns } from '../../utils/fetch'
import { formatPronouns } from '../../utils/pronouns'

export const name = 'osu!'
export const color = '#F372AD'
export const match = /^https:\/\/osu\.ppy\.sh/
export { default as Icon } from 'simple-icons/icons/osu.svg'

async function handleChatMessage (node: HTMLElement) {
	const sender = node.querySelector('.chat-message-group__sender')

	const userId = sender?.querySelector('a')?.dataset.userId

	if (!userId) return

	const pronouns = await fetchPronouns('osu', userId)

	if (!pronouns || !pronouns.sets.en) return

	const el = h('span', { class: 'u-ellipsis-overflow' }, formatPronouns(pronouns.sets.en))

	sender.appendChild(el)
}

async function handleMutation (mutations: MutationRecord[]) {
	for (const { addedNodes } of mutations) {
		for (const node of addedNodes) {
			if (node instanceof HTMLElement) {
				if (node.classList.contains('chat-message-group')) {
					handleChatMessage(node)
					continue
				}

				if (node.classList.contains('user-card--card') && !('userId' in node.dataset)) {
					handleUserPopout(node)
					continue
				}

				if (node.classList.contains('profile-info__info')) {
					handleUserProfile(node)
					continue
				}
			}
		}
	}
}

async function handleUserPopout (node: HTMLElement) {
	const userId = node.querySelector<HTMLAnchorElement>('.user-card__username')?.href.split('/').pop()

	if (!userId) return

	const pronouns = await fetchPronouns('osu', userId)

	if (!pronouns || !pronouns.sets.en) return

	const usernameAnchor = node.querySelector('.user-card__username')

	if (!usernameAnchor) return

	const el = h('span', { class: 'user-card__pronouns', style: css({ marginLeft: '5px' }) }, `- ${formatPronouns(pronouns.sets.en)}`)

	usernameAnchor.parentElement!.insertBefore(el, usernameAnchor.nextSibling)
}

async function handleUserProfile (node: HTMLElement) {
	const userId = window.location.pathname.split('/').pop()

	if (!userId) return

	const profileInfo = node.querySelector('.profile-info__flag')

	if (!profileInfo) return

	const pronouns = await fetchPronouns('osu', userId)

	if (!pronouns || !pronouns.sets.en) return

	const el = h('span', { class: 'profile-info__pronouns profile-info__flag-text' }, `- ${formatPronouns(pronouns.sets.en)}`)

	profileInfo.appendChild(el)
}

export function inject () {
	document.querySelectorAll<HTMLElement>('.chat-message-group').forEach((node) => handleChatMessage(node))

	if (document.querySelector('.profile-info__info')) {
		handleUserProfile(document.querySelector('.profile-info__info')!)
	}

	const observer = new MutationObserver(handleMutation)

	observer.observe(document, { childList: true, subtree: true })
}

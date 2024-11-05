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

import { fetchPronouns } from '../../utils/fetch'
import { formatPronouns } from '../../utils/pronouns'

export const name = 'Spotify'
export const color = '#1DB954'
export const match = /^https:\/\/open\.spotify\.com/
export { default as Icon } from 'simple-icons/icons/spotify.svg'

async function handleUserProfile (node: HTMLElement) {
	const followers = node.querySelector('div')

	if (!followers) return

	const userId = location.pathname.split('/')[2]

	const pronouns = await fetchPronouns('spotify', userId)

	if (!pronouns || !pronouns.sets.en) return

	const sep = followers.querySelector(':first-child')

	if (!sep) return

	const pronounsNode = document.createElement('span')

	pronounsNode.textContent = formatPronouns(pronouns.sets.en)

	followers.appendChild(pronounsNode)

	followers.appendChild(sep.cloneNode(true))
}

async function handleSmallUserProfile (node: HTMLElement) {
	const userIdContainer = node.children[1] as HTMLElement
	const clutteredUserId = userIdContainer.id.split(':').at(-1)

	if (!clutteredUserId) return

	const [ userId ] = clutteredUserId.split('-')

	if (!userId) return

	const pronouns = await fetchPronouns('spotify', userId)

	if (!pronouns || !pronouns.sets.en) return

	const usernameContainer = [ ...node.children ].at(-1) as HTMLElement

	if (!usernameContainer) return

	const profileContainer = usernameContainer.children[0].querySelector<HTMLElement>(':last-child > span > div')

	if (!profileContainer) return

	profileContainer.textContent += ` • ${formatPronouns(pronouns.sets.en)}`
}

function handleMutations (mutations: MutationRecord[]) {
	for (const { addedNodes } of mutations) {
		for (const node of addedNodes) {
			if (node instanceof HTMLElement) {
				if (node instanceof HTMLDivElement
					&& node.children.length >= 3
					&& [ ...node.childNodes ].some((child) => child instanceof HTMLElement && child.dataset.overlayscrollbarsInitialize && child.dataset.overlayscrollbars === 'host')) {
					const userProfile = node.querySelector<HTMLElement>('div > span.encore-text.encore-text-body-small')!.parentElement as HTMLElement

					handleUserProfile(userProfile)
				}

				if (node.nodeName === 'SECTION' && node.dataset.shelf) {
					const usersContainer = node.children[1] as HTMLElement

					for (const userContainer of usersContainer.children) {
						handleSmallUserProfile(userContainer as HTMLElement)
					}
				}
			}
		}
	}
}


export function inject () {
	const userProfile = document.querySelector('div > span.encore-text.encore-text-body-small')

	if (userProfile) {
		handleUserProfile(userProfile.parentElement as HTMLElement)
	}

	const usersList = document.querySelector('div.contentSpacing > section')?.children[1] as HTMLElement

	if (usersList) {
		for (const userContainer of usersList.children) {
			handleSmallUserProfile(userContainer as HTMLElement)
		}
	}

	const observer = new MutationObserver(handleMutations)
	observer.observe(document.body, { childList: true, subtree: true })
}

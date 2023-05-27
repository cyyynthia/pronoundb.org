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

import { commentDiscussion } from '../../icons/octicons'

import { formatPronouns } from '../../utils/pronouns'
import { fetchPronouns } from '../../utils/fetch'
import { h } from '../../utils/dom'

export const name = 'GitHub'
export const color = '#211F1F'
export const match = /^https:\/\/(.+\.)?github\.com/
export { default as Icon } from 'simple-icons/icons/github.svg'

async function injectUserProfile () {
	const userId = document.querySelector<HTMLElement>('[data-scope-id]')!.dataset.scopeId
	const list = document.querySelector('.vcard-details')
	if (!userId || !list) return

	const pronouns = await fetchPronouns('github', userId)
	if (!pronouns || !pronouns.sets.en) return

	const el = h(
		'li',
		{
			class: 'vcard-detail pt-1 css-truncate css-truncate-target hide-sm hide-md',
			itemprop: 'pronouns',
			show_title: false,
			'aria-label': `Pronouns: ${formatPronouns(pronouns.sets.en)}`,
		},
		commentDiscussion({ class: 'octicon' }),
		h('span', { class: 'p-label' }, formatPronouns(pronouns.sets.en))
	)

	list.appendChild(el)

	// Tabs do not trigger a page reload but does re-render everything, so we need to re-inject
	document.querySelectorAll('.UnderlineNav-item').forEach((tab) => {
		let hasTriggered = false
		tab.addEventListener('click', () => {
			if (hasTriggered) return

			hasTriggered = true
			const interval = setInterval(() => {
				if (!document.querySelector('.vcard-details [itemprop="pronouns"]')) {
					clearInterval(interval)
					injectUserProfile()
				}
			}, 100)
		})
	})
}

async function injectProfileLists () {
	const items = Array.from(document.querySelectorAll('.user-profile-nav + * .d-table')) as HTMLElement[]

	items.forEach(async (item) => {
		const pronouns = await fetchPronouns('github', item.querySelector('img')!.src.match(/\/u\/(\d+)/)![1])
		if (!pronouns || !pronouns.sets.en) return

		const col = item.querySelector<HTMLElement>('.d-table-cell + .d-table-cell')!
		let about = col.querySelector('.mb-0')
		const margin = Boolean(about)
		if (!about) {
			about = h('p', { class: 'color-fg-muted text-small mb-0' })
			col.appendChild(about)
		}

		about.appendChild(
			h(
				'span',
				{ class: margin ? 'ml-3' : '' },
				commentDiscussion({ class: 'octicon' }),
				'\n  ',
				formatPronouns(pronouns.sets.en)
			)
		)
	})
}

function injectHoverCards () {
	const popover = document.querySelector<HTMLElement>('.js-hovercard-content > .Popover-message')!

	const observer = new MutationObserver(
		async () => {
			const startHeight = popover.getBoundingClientRect().height
			const hv = popover.querySelector<HTMLElement>('[data-hydro-view]')?.dataset?.hydroView
			if (!hv) return

			const { event_type: type, payload: { card_user_id: userId } } = JSON.parse(hv)
			if (type !== 'user-hovercard-hover') return

			const block = popover.querySelector('section:nth-child(3)')
			if (!block) return

			const pronouns = await fetchPronouns('github', String(userId))
			if (!pronouns || !pronouns.sets.en) return

			block.parentElement?.insertBefore(
				h(
					'section',
					{ class: 'color-fg-muted' },
					commentDiscussion({ class: 'octicon' }),
					' ',
					formatPronouns(pronouns.sets.en)
				),
				block
			)

			if (popover.className.includes('Popover-message--bottom')) {
				const delta = popover.getBoundingClientRect().height - startHeight
				if (delta > 0 && popover.parentElement) {
					popover.parentElement.style.top = `${parseInt(popover.parentElement.style.top, 10) - delta}px`
				}
			}
		}
	)

	observer.observe(popover, { childList: true })
}

export function inject () {
	if (document.querySelector('.user-profile-bio')) {
		injectUserProfile()

		const tab = new URLSearchParams(location.search).get('tab')
		if (tab === 'followers' || tab === 'following') {
			injectProfileLists()
		}
	}

	injectHoverCards()

	document.head.appendChild(
		h('style', null, '.js-hovercard-content .d-flex .overflow-hidden.ml-3 .mt-2 + .mt-2 { margin-top: 4px !important; }')
	)
}

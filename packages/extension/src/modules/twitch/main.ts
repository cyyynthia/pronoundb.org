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

import { whisper } from '../../icons/twitch'

import { formatPronouns, formatPronounsShort, formatPronounsLong } from '../../utils/pronouns'
import { fetchPronouns } from '../../utils/fetch'
import { fetchReactProp } from '../../utils/proxy'
import { h, css } from '../../utils/dom'
import { LRUMap } from '../../utils/lru/lru'

import badgeComponent from './components/badge'

export const name = 'Twitch'
export const color = '#9146FF'
export const match = /^https:\/\/(.+\.)?twitch\.tv/
export { default as Icon } from 'simple-icons/icons/twitch.svg'

import stylesheet from './style.css?raw'
const styleElement = document.createElement('style')
styleElement.appendChild(document.createTextNode(stylesheet))
document.head.appendChild(styleElement)

const settings = {
	chat: true,
	popout: true,
	streamer: true,
	chatStyle: 'badge',
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
	if (!pronouns || !pronouns.sets.en) return

	if (settings.chatStyle === 'badge') {
		const badgesContainer = isFFZ
			? element.parentElement?.parentElement?.querySelector('.chat-line__message--badges')
			: element.parentElement?.parentElement?.parentElement?.firstChild
		if (!badgesContainer) return

		badgesContainer.insertBefore(
			badgeComponent(pronouns),
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
				` (${formatPronounsShort(pronouns.sets.en)})`
			)
		)
	}

	if (!document.querySelector('.chat-paused-footer')) {
		const scroller = document.querySelector('[data-a-target="chat-scroller"] .simplebar-scroll-content')
		scroller?.scrollTo(0, scroller.scrollHeight)
	}
}

let stvCompatInjected = false
const msgUserMap = new LRUMap<string, string>(500)
async function get7tvUserId (messageId: string) {
	let userId = msgUserMap.get(messageId)

	// eslint-disable-next-line no-unmodified-loop-condition
	while (!stvCompatInjected) await new Promise((r) => setTimeout(r, 100))

	for (let i = 0; i < 25 && !userId; i++) {
		// Sometimes the IDs are a bit slow to arrive...
		// We wait for them for up to 500 ms.
		await new Promise((r) => setTimeout(r, 20))
		userId = msgUserMap.get(messageId)
	}

	if (!userId) {
		// Didn't receive a user id for a message, probably an injection fail (?)
		// Attempt to re-bind the 7tv compat layer out of precaution
		// It'll no-op if it is already bound properly
		console.warn('[PronounDB] 7TV compat: Could not resolve user ID. Attempting re-injection')
		bind7tvCompat()
	}

	return userId
}

async function inject7tvChat (message: HTMLElement) {
	const messageId = message.getAttribute('msg-id')
	if (!messageId) return

	const userId = await get7tvUserId(messageId)
	if (!userId) return

	const pronouns = await fetchPronouns('twitch', userId)
	if (!pronouns || !pronouns.sets.en) return

	const user = message.querySelector<HTMLElement>('.seventv-chat-user')
	if (!user) return

	if (settings.chatStyle === 'badge') {
		user.insertBefore(
			badgeComponent(pronouns),
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
				` (${formatPronounsShort(pronouns.sets.en)})`
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
	if (!pronouns || !pronouns.sets.en) return

	const badge = badgeComponent(pronouns)
	badge.setAttribute('style', css({ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }))

	const username = header.querySelector('span')
	username!.parentElement!.appendChild(
		h('div', { style: css({ marginLeft: '8px' }) }, badge)
	)
}

async function injectViewerCard (element: HTMLElement) {
	const container = element.querySelector<HTMLElement>('.viewer-card-header__display-name')
	if (!container) return

	const query = { $find: 'targetUser', $in: [ 'child', 'sibling', 'memoizedProps', '0', '1' ] }
	const cardId = await fetchReactProp(element, [ query, 'targetUser', 'id' ])
	if (!cardId) return

	const pronouns = await fetchPronouns('twitch', cardId)
	if (!pronouns || !pronouns.sets.en) return

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
				formatPronounsLong(pronouns.sets.en)
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
	if (!pronouns || !pronouns.sets.en) return

	const el = document.querySelector('.about-section div + div span div')
	if (!el) return

	const prevPronounsContainer = el.querySelector<HTMLElement>('.pronoundb-streamer-about div')
	if (prevPronounsContainer) {
		prevPronounsContainer.innerText = formatPronouns(pronouns.sets.en)
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

	el.appendChild(h('div', {}, formatPronouns(pronouns.sets.en)))
}

function handle7tvMessage (e: MessageEvent) {
	if (e.source === window && e.data?.source === 'pronoundb') {
		const data = e.data.payload
		if (data.action === 'ttv.chat.msg') {
			msgUserMap.set(data.id, data.user)
		}
	}
}

function bind7tvCompat () {
	stvCompatInjected = false

	// Send inject request
	const send = () => window.postMessage({ source: 'pronoundb', payload: { action: 'ttv.inject-chat' } })
	const interval = setInterval(send, 1e3)
	send()

	// Await for the acknowledgement of injection
	const onMsg = (e: MessageEvent) => {
		if (e.source === window && e.data?.source === 'pronoundb') {
			const data = e.data.payload
			if (data.action === 'ttv.inject-chat.ack') {
				clearInterval(interval)
				window.removeEventListener('message', onMsg)
				stvCompatInjected = true
			}
		}
	}

	window.addEventListener('message', onMsg)
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
						console.log('[PronounDB] 7TV detected. Injecting compatibility code')
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

	// Inject 7tv compat code
	window.addEventListener('message', handle7tvMessage)
	if (document.querySelector('.seventv-chat-scroller')) {
		console.log('[PronounDB] 7TV detected. Injecting compatibility code')
		bind7tvCompat()
	}

	// Start observer
	const observer = new MutationObserver(handleMutation)
	observer.observe(document, { childList: true, subtree: true })
}

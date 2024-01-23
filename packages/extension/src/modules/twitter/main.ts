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

import { topics } from '../../icons/twitter'

import { formatPronouns } from '../../utils/pronouns'
import { fetchPronouns } from '../../utils/fetch'
import { fetchReactProp } from '../../utils/proxy'
import { h, css } from '../../utils/dom'

import { decorateAvatar, clearAvatar } from './avatar'

// Never change this to X
export const name = 'Twitter'
export const color = '#1DA1F2'
export const match = /^https:\/\/(.+\.)?twitter\.com/
export { default as Icon } from '../../../assets/twitter.svg'

import stylesheet from './style.css?raw'
const styleElement = document.createElement('style')
styleElement.appendChild(document.createTextNode(stylesheet))
document.head.appendChild(styleElement)

const self = Symbol('username.self')
const usernameToIdCache = Object.create(null)

function clearProfileHeader () {
	document.querySelector('[data-testid="UserProfileHeader_Items"] [data-pronoundb]')?.remove()

	const avatarContainer = document.querySelector<HTMLElement>('[data-testid="primaryColumn"] [data-testid^="UserAvatar-Container"]')
	if (avatarContainer?.hasAttribute('style') === false) {
		const decorated = avatarContainer.querySelector<HTMLElement>('.pronoundb-decorated')
		if (decorated) clearAvatar(decorated)
	}
}

async function injectProfileHeader (username?: string) {
	// Remove stale info from the profile
	clearProfileHeader()

	// Mark avatar as handled
	const avatar = document.querySelector<HTMLElement>('[data-testid^="UserAvatar-Container"] a')
	if (avatar) avatar.dataset.pdbHandled = 'true'

	// Process the header
	let header: HTMLElement
	if (username) {
		let currentUsername
		do {
			// Make sure the UI updated
			await new Promise((resolve) => setTimeout(resolve, 10))
			header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
			currentUsername = await fetchReactProp(header.parentElement!, [ { $find: 'user', $in: [ 'return', 'memoizedProps' ] }, 'user', 'screen_name' ])
		} while (currentUsername !== username)
	} else {
		username = document.head.querySelector('meta[property="al:android:url"]')?.getAttribute('content')?.split('=')[1]
		header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
	}

	let id: string

	// Use a cache to avoid round-trips to the webpage context
	if (username && username in usernameToIdCache) {
		id = usernameToIdCache[username]
	} else {
		const node = header.parentElement!
		id = await fetchReactProp(node, [ { $find: 'user', $in: [ 'return', 'memoizedProps' ] }, 'user', 'id_str' ])
		if (username && id) usernameToIdCache[username] = id
	}

	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const prevPronouns = header.querySelector<HTMLElement>('[data-pronoundb]')
		if (prevPronouns) {
			prevPronouns.replaceChild(document.createTextNode(formatPronouns(pronouns.sets.en)), prevPronouns.childNodes[1])
			return
		}

		const template = header.children[header.children.length - 1]
		header.appendChild(
			h(
				'span',
				{ class: template.className, style: template.getAttribute('style'), 'data-pronoundb': 'true' },
				topics({ class: template.children[0]?.getAttribute('class') ?? '' }),
				formatPronouns(pronouns.sets.en)
			)
		)
	}

	if (avatar && pronouns.decoration) {
		decorateAvatar(avatar, pronouns.decoration, 'profile')
	}
}

async function injectTweet (tweet: HTMLElement) {
	let imgWrapper = tweet.querySelector<HTMLElement>('[data-testid="Tweet-User-Avatar"] :is(a, div[role=presentation])')

	// Immediately mark the underlying image as handled; we'll handle it here to avoid doing a double ID lookup
	if (imgWrapper) imgWrapper.dataset.pdbHandled = 'true'

	// Now process the tweet
	let id: string
	// Use a cache to avoid round-trips to the webpage context
	const username = tweet.querySelector<HTMLElement>('[data-testid="User-Name"] > div:nth-child(2) span')?.innerText.slice(1)
	if (username && username in usernameToIdCache) {
		id = usernameToIdCache[username]
	} else {
		const directId = await fetchReactProp(tweet, [ { $find: 'tweet', $in: [ 'return', 'memoizedProps' ] }, 'tweet', 'user', 'id_str' ])
		const retweetId = await fetchReactProp(tweet, [ { $find: 'tweet', $in: [ 'return', 'memoizedProps' ] }, 'tweet', 'retweeted_status', 'user', 'id_str' ])
		id = retweetId || directId

		if (username && id) usernameToIdCache[username] = id
	}

	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const dateContainer = tweet.querySelector(tweet.dataset.testid === 'tweet' ? 'a time' : 'time')?.parentElement
		const parentContainer = dateContainer?.parentElement
		if (!dateContainer || !parentContainer) return

		const containerClass = dateContainer.className
		parentContainer.querySelector('.pronoundb-container')?.remove()
		parentContainer.appendChild(
			h(
				'div',
				{ class: `${containerClass} pronoundb-container`, style: dateContainer.getAttribute('style') },
				h('span', { class: 'pronoundb-void' }, '​'),
				h('span', { class: 'pronoundb-separator' }, '·'),
				h('span', { class: 'pronoundb-pronouns' }, formatPronouns(pronouns.sets.en))
			)
		)
	}

	// Now, handle the decoration
	if (imgWrapper && imgWrapper.tagName === 'A' && pronouns.decoration) {
		decorateAvatar(imgWrapper, pronouns.decoration, 'tweet')
	}
}

async function injectProfilePopOut (popout: HTMLElement) {
	// Mark avatar as handled
	const avatar = document.querySelector<HTMLElement>('[data-testid^="UserAvatar-Container"] a')
	if (avatar) avatar.dataset.pdbHandled = 'true'

	const userInfo = popout.querySelector('a + div')?.parentElement
	const template = userInfo?.querySelector<HTMLElement>('a[tabindex="-1"] [dir=ltr]')
	if (!template || !userInfo) return

	const id = await fetchReactProp(popout, [ 'memoizedProps', 'children', '2', 'props', 'children', 'props', 'userId' ])
	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const childClass = template.children[0].className
		const parentClass = template.className
		const parentStyle = template.getAttribute('style')

		const element = h(
			'span',
			{
				class: parentClass,
				style: parentStyle,
				'data-pronoundb': 'true'
			},
			h(
				'span',
				{
					class: childClass,
					style: css({
						display: 'flex',
						alignItems: 'center',
						marginRight: '4px',
					}),
				},
				topics({
					style: css({
						color: 'inherit',
						fill: 'currentColor',
						width: '1.1em',
						height: '1.1em',
						marginRight: '4px',
					}),
				}),
				formatPronouns(pronouns.sets.en)
			)
		)

		const prevPronouns = popout.querySelector('[data-pronoundb]')
		if (prevPronouns) prevPronouns.remove()
		userInfo.appendChild(element)
	}

	if (avatar && pronouns.decoration) {
		decorateAvatar(avatar, pronouns.decoration, 'popout')
	}
}

async function injectAvatarDecoration (img: HTMLElement) {
	const wrapper = img.parentElement?.parentElement?.parentElement?.parentElement?.parentElement
	if (!wrapper || wrapper.dataset.pdbHandled === 'true') return

	let id: string
	if (wrapper.tagName === 'DIV') {
		if (!document.querySelector('header')?.contains(wrapper) && !document.querySelector('#layers')?.contains(wrapper)) return
		if (self in usernameToIdCache) {
			id = usernameToIdCache[self]
		} else {
			// Self user account
			id = await fetchReactProp(wrapper, [ { $find: 'id_str', $in: [ 'return', 'memoizedProps', 'currentUser', 'viewerUser' ] }, 'id_str' ])
			if (id) usernameToIdCache[self] = id
		}
	} else {
		// Classic flow with cache possibility
		const username = wrapper.getAttribute('href')?.split('/')[1]
		if (username && username in usernameToIdCache) {
			id = usernameToIdCache[username]
		} else {
			id = await fetchReactProp(wrapper, [ { $find: 'userId', $in: [ 'return', 'memoizedProps' ] }, 'userId' ])
			if (!id) id = await fetchReactProp(wrapper, [ { $find: 'id_str', $in: [ 'return', 'memoizedProps', 'viewerUser' ] }, 'id_str' ])
			if (username && id) usernameToIdCache[username] = id
		}
	}

	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.decoration) {
		decorateAvatar(wrapper, pronouns.decoration)
	}
}

function handleLayoutRepaint () {
	const header = document.querySelector('[data-testid="UserProfileHeader_Items"]')
	if (header) injectProfileHeader()
}

function handleMutation (nodes: MutationRecord[]) {
	const layers = document.querySelector<HTMLElement>('#layers')
	if (!layers) return

	for (const { addedNodes } of nodes) {
		for (const added of addedNodes) {
			if (added instanceof HTMLElement) {
				if (added.parentElement?.parentElement?.tagName === 'MAIN') {
					handleLayoutRepaint()
				}

				if (
					added.tagName === 'META'
					&& added.getAttribute('property') === 'al:android:url'
					&& added.getAttribute('content')?.startsWith('twitter://user?')
				) {
					injectProfileHeader(added.getAttribute('content')?.split('=')[1])
					continue
				}

				if (
					added.tagName === 'LINK'
					&& added.getAttribute('rel') === 'canonical'
					&& document.head.querySelector('meta[property="al:android:url"]')?.getAttribute('content')?.startsWith('twitter://user?')
				) {
					if (document.querySelector('[data-testid="UserProfileHeader_Items"] [data-pronoundb]')) continue
					injectProfileHeader(added.getAttribute('content')?.split('=')[1])
					continue
				}

				const tweet = added.querySelector<HTMLElement>('[data-testid="tweet"]')
				if (tweet) {
					const prevPronouns = tweet.querySelector('[data-pronoundb]')
					if (prevPronouns) prevPronouns.remove()
					injectTweet(tweet)

					const quoteTweet = tweet.querySelector<HTMLElement>('[aria-labelledby][id] > [id] [tabindex="0"]')
					if (quoteTweet && quoteTweet.querySelector('time')) {
						injectTweet(quoteTweet)
					}

					continue
				}

				// Decorations
				if (added.tagName === 'IMG' && added.getAttribute('src')?.includes('/profile_images/')) {
					injectAvatarDecoration(added)
					continue
				}

				if (added.children[0]?.children[0]?.role === 'progressbar' && added.querySelector('[data-testid="createPollButton"]')) {
					const img = added.querySelector<HTMLElement>('img')
					if (img) injectAvatarDecoration(img)
					continue
				}

				if (layers.contains(added)) {
					const link = added.querySelector('a[href*="/following"]')
					if (link) injectProfilePopOut(link.parentElement!.parentElement!.parentElement!.parentElement!)
					continue
				}
			}
		}
	}
}

export function inject () {
	handleLayoutRepaint()

	const observer = new MutationObserver(handleMutation)
	observer.observe(document, { childList: true, subtree: true })
}

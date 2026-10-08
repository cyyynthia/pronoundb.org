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

import { messageBubble } from '../../icons/twitter.ts'

import { formatPronouns } from '../../utils/pronouns.ts'
import { fetchPronouns } from '../../utils/fetch.ts'
import { fetchReactProp } from '../../utils/proxy.ts'
import { css, h } from '../../utils/dom.ts'

import { clearAvatar, decorateAvatar } from './avatar.ts'

// Never change this to X
export const name = 'Twitter'
export const color = '#1DA1F2'
export const match = /^https:\/\/(.+\.)?(twitter|x)\.com/
export { default as Icon } from '../../../assets/twitter.svg'

function setupStylesheet () {
	const stylePdblib = document.createElement('link')
	const styleTwitter = document.createElement('link')
	stylePdblib.setAttribute('rel', 'stylesheet')
	styleTwitter.setAttribute('rel', 'stylesheet')
	stylePdblib.setAttribute('href', chrome.runtime.getURL(window.__BUILD_STYLESHEET__.pdblib))
	styleTwitter.setAttribute('href', chrome.runtime.getURL(window.__BUILD_STYLESHEET__.twitter))
	document.head.appendChild(stylePdblib)
	document.head.appendChild(styleTwitter)
}

const self = Symbol('username.self')
const usernameToIdCache = Object.create(null)

function clearProfileHeader () {
	document.querySelector('[data-testid="UserProfileHeader_Items"] [data-pronoundb]')?.remove()

	const avatarContainer = document.querySelector<HTMLElement>('[data-testid="primaryColumn"] [data-testid^="UserAvatar-Container"]')
	if (avatarContainer?.hasAttribute('style') === false) {
		const decorated = avatarContainer.querySelector<HTMLElement>('.pronoundb-decoration-wrapper a')
		if (decorated) clearAvatar(decorated)
	}
}

async function injectProfileHeader () {
	// Remove potential stale info from the profile
	clearProfileHeader()

	// Mark avatar as handled
	const avatar = document.querySelector<HTMLElement>('[data-testid^="UserAvatar-Container"] a')
	if (avatar) avatar.dataset.pdbHandled = 'true'

	// Process the header
	let header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
	while (!header) {
		await new Promise((resolve) => setTimeout(resolve, 10))
		header = document.querySelector<HTMLElement>('[data-testid="UserProfileHeader_Items"]')!
	}

	const username = header?.parentElement?.parentElement?.querySelector<HTMLElement>('[data-testid="UserName"] div + div > [tabindex="-1"] span')?.innerText.slice(1)
	let id: string

	// Use a cache to avoid round-trips to the webpage context
	if (username && username in usernameToIdCache) {
		id = usernameToIdCache[username]
	} else {
		const node = header.parentElement!
		// Check if we are getting *real* data, it somehow sometimes lags behind for some reason??
		let memoizedUsername = ''
		for (let i = 0; i < 100; i++) {
			memoizedUsername = await fetchReactProp(node, [ { $find: 'user', $in: [ 'return', 'memoizedProps' ] }, 'user', 'screen_name' ])
			if (memoizedUsername === username) break

			await new Promise((r) => setTimeout(r, 10))
		}

		// We're about to fetch the wrong data
		if (memoizedUsername !== username) return

		id = await fetchReactProp(node, [ { $find: 'user', $in: [ 'return', 'memoizedProps' ] }, 'user', 'id_str' ])
		if (username && id) usernameToIdCache[username] = id
	}

	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const formattedPronouns = formatPronouns(pronouns.sets.en)
		if (!formattedPronouns) return

		const prevPronouns = header.querySelector<HTMLElement>('[data-pronoundb]')
		if (prevPronouns) {
			prevPronouns.replaceChild(document.createTextNode(formattedPronouns), prevPronouns.childNodes[1])
			return
		}

		const template = header.children[header.children.length - 1].children[0]
		const classes = template.className.split(' ').slice(0, -1).join(' ')
		header.appendChild(
			h(
				'span',
				{ class: classes, style: template.getAttribute('style'), 'data-pronoundb': 'true' },
				messageBubble({ class: template.children[0]?.getAttribute('class') ?? '' }),
				formattedPronouns
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

		// Tweets can be removed and injected again, and in this case we cannot trust the data from `directId` and `retweetId`
		if (!tweet.isConnected) return

		id = retweetId || directId
		if (username && id) usernameToIdCache[username] = id
	}

	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const formattedPronouns = formatPronouns(pronouns.sets.en)
		if (!formattedPronouns) return

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
				h('span', { class: 'pronoundb-pronouns' }, formattedPronouns)
			)
		)
	}

	// Now, handle the decoration
	if (imgWrapper && imgWrapper.tagName === 'A' && pronouns.decoration) {
		decorateAvatar(imgWrapper, pronouns.decoration, 'tweet')
	}
}

async function injectDmHeader (element: HTMLElement) {
	element.classList.add('pdb-dm-header')

	// Group DM
	if (element.querySelectorAll('[data-testid^="UserAvatar-Container"]').length > 1) return

	// Mark avatar as handled
	const avatar = element.querySelector<HTMLElement>('a[data-testid="DM_Conversation_Avatar"] div[role="presentation"]')
	if (avatar) avatar.dataset.pdbHandled = 'true'

	// Remove previous pronouns shown (probably outdated)
	const previousPronouns1 = element.querySelector('.pronoundb-pronouns-container')
	if (previousPronouns1) previousPronouns1.remove()

	const header = element.querySelector<HTMLElement>('h2')
	const headerContainer = header?.parentElement
	if (!header || !headerContainer) return

	for (let i = 0; i < 20; i++) { // Wait full view to be loaded
		if (header.firstElementChild?.tagName === 'DIV') break
		await new Promise((r) => setTimeout(r, 25))
	}

	const id = await fetchReactProp(header, [ 'return', { $find: 'participants', $in: [ 'child', 'pendingProps' ] }, 'participants', '0', 'id_str' ])
	if (!id) return

	// Remove again, in case there's a race condition
	const previousPronouns2 = element.querySelector('.pronoundb-pronouns-container')
	if (previousPronouns2) previousPronouns2.remove()

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const formattedPronouns = formatPronouns(pronouns.sets.en)
		if (!formattedPronouns) return

		let placeholderRoot = null
		for (let i = 0; i < 20; i++) { // Wait for placeholder to be loaded
			placeholderRoot = document.querySelector('.draftjs-styles_0 .public-DraftEditorPlaceholder-root')
			if (placeholderRoot) break

			await new Promise((r) => setTimeout(r, 50))
		}
		if (!placeholderRoot) return

		const placeholderStyledContainer = getComputedStyle(placeholderRoot)
		const textareaStyledContainer = getComputedStyle(document.querySelector('aside[role="complementary"] > div + div')!)
		headerContainer.style.display = 'flex'
		headerContainer.style.flexDirection = 'row'
		headerContainer.style.alignItems = 'center'
		headerContainer.style.gap = '8px'
		headerContainer.appendChild(
			h(
				'div',
				{
					class: `${header.className} pronoundb-pronouns-container`,
					style: css({
						fontSize: '11px',
						fontWeight: '500',
						lineHeight: '12px',
						height: '28px',
						display: 'flex',
						alignItems: 'center',
					}),
				},
				h(
					'span',
					{
						class: 'pronoundb-pronouns',
						style: css({
							padding: '2px 4px',
							borderRadius: '4px',
							marginTop: '2px',
							backgroundColor: textareaStyledContainer.backgroundColor,
							color: placeholderStyledContainer.color,
						}),
					},
					formattedPronouns
				)
			)
		)
	}

	if (avatar && pronouns.decoration) {
		decorateAvatar(avatar, pronouns.decoration, 'popout')
	}
}

async function injectDmDrawerHeader (element: HTMLElement) {
	const container = element.parentElement
	const username = element.innerText.slice(1)
	const template = element.firstElementChild

	if (!container || !template || !username) return

	let id: string
	if (username && username in usernameToIdCache) {
		id = usernameToIdCache[username]
	} else {
		id = await fetchReactProp(container, [ { $find: 'participants', $in: [ 'child', 'memoizedProps' ] }, 'participants', '0', 'id_str' ])
		if (username && id) usernameToIdCache[username] = id
	}

	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const formattedPronouns = formatPronouns(pronouns.sets.en)
		if (!formattedPronouns) return

		const separatorElement = template.cloneNode(true) as HTMLElement
		const pronounsElement = template.cloneNode(true) as HTMLElement

		separatorElement.style.marginLeft = '4px'
		pronounsElement.style.marginLeft = '4px'

		separatorElement.innerText = '·'
		pronounsElement.innerText = formattedPronouns

		element.appendChild(separatorElement)
		element.appendChild(pronounsElement)
	}
}

async function injectDmUserInfo (element: HTMLElement) {
	element.classList.add('pdb-dm-user-info')

	// Mark avatar as handled
	const avatar = element.querySelector<HTMLElement>('[data-testid^="UserAvatar-Container"] div[aria-hidden][role="presentation"]')
	if (avatar) avatar.dataset.pdbHandled = 'true'

	const userInfo = element.querySelector('div[data-testid="UserDescription"] + div')
	const template = userInfo?.firstElementChild
	const separator = template?.nextElementSibling
	if (!userInfo || !template || !separator) return

	const id = await fetchReactProp(element, [ { $find: 'userId', $in: [ 'child', 'memoizedProps', 'props', 'sibling' ] }, 'userId' ])
	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const formattedPronouns = formatPronouns(pronouns.sets.en)
		if (!formattedPronouns) return

		const separatorEl = separator.cloneNode(true) as HTMLElement
		const pronounsEl = template.cloneNode(true) as HTMLElement
		pronounsEl.innerText = formattedPronouns

		userInfo.appendChild(separatorEl)
		userInfo.appendChild(pronounsEl)
	}

	if (avatar && pronouns.decoration) {
		decorateAvatar(avatar, pronouns.decoration, 'popout')
	}
}

async function injectProfilePopOut (popout: HTMLElement) {
	// Mark avatar as handled
	const avatar = document.querySelector<HTMLElement>('[data-testid^="UserAvatar-Container"] a')
	if (avatar) avatar.dataset.pdbHandled = 'true'

	const userInfo = popout.querySelector('a + div')?.parentElement
	const template = userInfo?.querySelector<HTMLElement>('a[tabindex="-1"] [dir=ltr]')
	if (!template || !userInfo) return

	const id = await fetchReactProp(popout, [ 'memoizedProps', { $find: 'userId', $in: [ 'children', '0', '1', '2', 'props' ] }, 'userId' ])
	if (!id) return

	const pronouns = await fetchPronouns('twitter', id)
	if (!pronouns) return

	if (pronouns.sets.en) {
		const formattedPronouns = formatPronouns(pronouns.sets.en)
		if (!formattedPronouns) return

		const childClass = template.children[0].className
		const parentClass = template.className
		const parentStyle = template.getAttribute('style')

		const element = h(
			'span',
			{
				class: parentClass,
				style: parentStyle,
				'data-pronoundb': 'true',
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
				messageBubble({
					style: css({
						color: 'inherit',
						fill: 'currentColor',
						width: '1.1em',
						height: '1.1em',
						marginRight: '4px',
					}),
				}),
				formattedPronouns
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

	const contextTestId = wrapper.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.dataset?.testid
	if (contextTestId === 'MutlipleParticipantAvatarContainer') return // Group DM
	if (contextTestId === 'notification') return // Notification small avatar

	const usernameContextTestId = wrapper.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.dataset?.testid
	if (usernameContextTestId === 'User-Name') return // Small affiliated business

	let id: string
	if (wrapper.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement?.dataset?.testid === 'DM_Conversation_Avatar') {
		// DM -- special handling cuz IDs are a bit of a pain
		let pov: string
		if (self in usernameToIdCache) {
			pov = usernameToIdCache[self]
		} else {
			pov = await fetchReactProp(wrapper, [ { $find: 'perspective', $in: [ 'return', 'memoizedProps' ] }, 'perspective' ])
			if (!pov) return

			usernameToIdCache[self] = pov
		}

		const convId = await fetchReactProp(wrapper, [ { $find: 'conversation', $in: [ 'return', 'memoizedProps' ] }, 'conversation', 'conversation_id' ])
		if (!convId) return

		id = convId.replace(pov, '').replace('-', '')
	} else if (wrapper.tagName === 'DIV') {
		let isSelf = false
		let queryPath
		let queryId

		if (document.querySelector('header')?.contains(wrapper)) {
			isSelf = true
			queryPath = [ 'return', 'memoizedProps', 'currentUser' ]
			queryId = [ 'id_str' ]
		}

		const layers = document.querySelector('#layers')
		if (layers?.contains(wrapper)) {
			if (layers?.querySelector('[data-testid="tweetTextarea_0_label"]') && !wrapper.ariaHidden) {
				isSelf = true
				queryPath = [ 'return', 'memoizedProps', 'currentUser' ]
				queryId = [ 'id_str' ]
			} else {
				queryPath = [ 'return', 'memoizedProps' ]
				queryId = [ 'userId' ]
			}
		}

		if (!queryPath || !queryId) return
		if (isSelf && self in usernameToIdCache) {
			id = usernameToIdCache[self]
		} else {
			id = await fetchReactProp(wrapper, [ { $find: queryId[0], $in: queryPath }, ...queryId ])
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

	const composeAvatar = document.querySelector<HTMLElement>('div:has(> [role="progressbar"]):has([data-testid="createPollButton"]) img')
	if (composeAvatar) injectAvatarDecoration(composeAvatar)
}

function handleMutation (nodes: MutationRecord[]) {
	const layers = document.querySelector<HTMLElement>('#layers')
	if (!layers) return

	for (const { addedNodes } of nodes) {
		for (const added of addedNodes) {
			if (added instanceof HTMLElement && added.tagName !== 'SCRIPT') {
				if (added.parentElement?.parentElement?.tagName === 'MAIN') {
					handleLayoutRepaint()
					continue
				}

				if (
					added.children[0]?.getAttribute('data-testid') === 'UserDescription'
					|| added.children[0]?.children[0]?.querySelector('[data-testid="UserProfileHeader_Items"]')
					|| added.querySelector(':scope > div > div[data-testid="UserName"]')
				) {
					injectProfileHeader()
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

				// DM Header
				if (added.querySelector('a[href^="/messages"][href$="/info"]')) {
					injectDmHeader(added)
					continue
				}

				if (
					(added.tagName === 'A' && added.getAttribute('href')?.startsWith('/messages/') && added.getAttribute('href')?.endsWith('/info'))
					|| (added.querySelector(':is(:scope, :scope > div + div > div) > h2[role="heading"]') && added.parentElement?.parentElement?.querySelector('a[href^="/messages"][href$="/info"]'))
				) {
					const element = document.querySelector<HTMLElement>('section[role="region"] div[data-viewportview="true"] > div:has(a[href^="/messages"][href$="/info"])')
					if (element) injectDmHeader(element)
					continue
				}

				if (added.firstElementChild?.getAttribute('data-testid') === 'DMDrawerHeader') {
					const username = added.querySelector<HTMLElement>('h2 + div')
					if (username) injectDmDrawerHeader(username)
					continue
				}

				// DM recipient Info
				if (added.dataset.testid === 'cellInnerDiv' && added.querySelector('[data-testid="UserDescription"]')) {
					injectDmUserInfo(added)
					continue
				}

				// Decorations
				if (added.tagName === 'IMG') {
					const src = added.getAttribute('src')
					if (src && src.includes('/profile_images/') && !src.includes('_mini.')) {
						injectAvatarDecoration(added)
						continue
					}
				}

				if (added.children[0]?.children[0]?.role === 'progressbar' && added.querySelector('[data-testid="createPollButton"]')) {
					const img = added.querySelector<HTMLElement>('img')
					if (img) injectAvatarDecoration(img)
					continue
				}

				if (layers.contains(added)) {
					const link = added.querySelector('a[href*="/following"]')
					if (link) {
						injectProfilePopOut(link.parentElement!.parentElement!.parentElement!.parentElement!)
						continue
					}

					if (added.children[0]?.getAttribute('data-testid') === 'twc-cc-mask') {
						const img = added.querySelector<HTMLElement>('img')
						if (img) injectAvatarDecoration(img)

						// noinspection UnnecessaryContinueJS
						continue
					}
				}
			}
		}
	}
}

export function inject () {
	setupStylesheet()
	handleLayoutRepaint()

	const observer = new MutationObserver(handleMutation)
	observer.observe(document, { childList: true, subtree: true })
}

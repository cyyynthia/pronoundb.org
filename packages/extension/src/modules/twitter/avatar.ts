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

import { h, css } from '../../utils/dom'
import { fetchDecoration } from '../../core/decoration'

type Place = 'profile' | 'tweet' | 'popout' | 'other'

export async function decorateAvatar (el: HTMLElement, decoration: string, place: Place = 'other') {
	const d = await fetchDecoration(decoration)
	if (!d) return

	if (el.classList.contains('pronoundb-decorated')) {
		clearAvatar(el)
	}

	const hasBorder = place === 'profile'
	const isBig = place === 'profile'
	const smallerDecoration = place === 'profile' || place === 'popout'

	el.classList.add('pronoundb-decorated', `pronoundb-decorated-${place}`)

	// Make room for the ring
	const parent = el.parentElement!

	parent.dataset.twitterStyles = parent.getAttribute('style') || ''
	parent.classList.add('pronoundb-decoration-wrapper')
	parent.setAttribute('style', css({
		'---pdb-top': isBig ? '-10px' : '-6px',
		left: isBig ? '-10px' : '-6px',
		width: isBig ? 'calc(100% + 20px)' : 'calc(100% + 12px)',
		height: isBig ? 'calc(100% + 20px)' : 'calc(100% + 12px)',
		padding: isBig ? '8px' : '4px',
		overflow: 'visible',
		clipPath: 'none',
	}))

	// Transform the outline into a ring
	const outlineWrapper = el.firstElementChild! as HTMLElement
	const wrapperStyles = outlineWrapper.computedStyleMap()
	const background = document.body.style.backgroundColor || 'white'

	outlineWrapper.classList.add('pronoundb-border')
	outlineWrapper.dataset.twitterStyles = outlineWrapper.getAttribute('style') || ''
	outlineWrapper.style.width = isBig ? 'calc(100% + 12px)' : 'calc(100% + 4px)'
	outlineWrapper.style.height = isBig ? 'calc(100% + 12px)' : 'calc(100% + 4px)'

	const clipPath = wrapperStyles.get('clip-path')?.toString() ?? 'none'

	let offset = '0'
	if (clipPath.includes('-square')) offset = '-18%'
	else if (clipPath.includes('-hex')) offset = '-4%'

	let position = '15%'
	if (clipPath.includes('-square')) position = '4%'

	outlineWrapper.appendChild(
		h(
			'div',
			{
				class: 'pronoundb-border-inner-wrapper',
				style: css({
					overflow: 'hidden',
					position: 'absolute',
					top: hasBorder ? '4px' : '0',
					left: hasBorder ? '4px' : '0',
					right: hasBorder ? '4px' : '0',
					bottom: hasBorder ? '4px' : '0',
					borderRadius: wrapperStyles.get('border-radius')?.toString() ?? '50%',
					clipPath: wrapperStyles.get('clip-path')?.toString() ?? 'none',
				}),
			},
			h('div', {
				class: 'pronoundb-border-inner',
				style: css({
					background: d.border(parent),
					position: 'absolute',
					top: offset,
					left: offset,
					right: offset,
					bottom: offset,
				}),
			})
		)
	)

	if (d.animation.border) {
		outlineWrapper.classList.add(`pronoundb-animate-${d.animation.border}`)
	}

	// Add elements
	if (d.elements.topLeft) {
		const deco = h(
			'div',
			{
				class: 'pronoundb-decoration pronoundb-decoration-top-left',
				style: css({
					position: 'absolute',
					transform: 'translate(-50%, -50%)',
					width: smallerDecoration ? '35%' : '50%',
					top: position,
					left: position,
					color: background,
				}),
			},
			d.elements.topLeft.cloneNode(true)
		)
		el.appendChild(deco)

		if (d.animation.topLeft) {
			deco.classList.add(`pronoundb-animate-${d.animation.topLeft}`)
		}
	}

	if (d.elements.bottomRight) {
		const deco = h(
			'div',
			{
				class: 'pronoundb-decoration pronoundb-decoration-bottom-right',
				style: css({
					position: 'absolute',
					transform: 'translate(50%, 50%)',
					width: smallerDecoration ? '35%' : '50%',
					bottom: position,
					right: position,
					color: background,
				}),
			},
			d.elements.bottomRight.cloneNode(true)
		)
		el.appendChild(deco)

		if (d.animation.bottomRight) {
			deco.classList.add(`pronoundb-animate-${d.animation.bottomRight}`)
		}
	}
}

export function clearAvatar (el: HTMLElement) {
	const elPdbClasses = Array.from(el.classList).filter((c) => c.includes('pronoundb'))
	el.classList.remove(...elPdbClasses)

	const parent = el.parentElement!
	parent.classList.remove('pronoundb-decoration-wrapper')
	parent.setAttribute('style', parent.dataset.twitterStyles || '')
	parent.dataset.twitterStyles = ''

	const outlineWrapper = el.firstElementChild! as HTMLElement
	const outlinePdbClasses = Array.from(outlineWrapper.classList).filter((c) => c.includes('pronoundb'))
	outlineWrapper.classList.remove(...outlinePdbClasses)
	outlineWrapper.setAttribute('style', outlineWrapper.dataset.twitterStyles || '')
	outlineWrapper.dataset.twitterStyles = ''

	el.querySelector('.pronoundb-border-inner-wrapper')?.remove()
	el.querySelector('.pronoundb-decoration')?.remove()
	el.querySelector('.pronoundb-decoration')?.remove()
}

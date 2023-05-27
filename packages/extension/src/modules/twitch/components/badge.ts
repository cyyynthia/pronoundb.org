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

import type { UserData } from '@pronoundb/pronouns/sets'
import { h, css } from '../../../utils/dom'
import { formatPronounsShort } from '../../../utils/pronouns'
import { fetchDecoration } from '../../../core/decoration'

const BADGE_WRAPPER = css({
	display: 'inline',
	position: 'relative',
	bottom: '-1px',
	marginRight: '4px',
})

const BADGE_INNER = css({
	display: 'inline-block',
	borderRadius: 'var(--border-radius-large)',
	backgroundColor: 'var(--color-background-button-secondary-default)',
	color: 'var(--color-text-button-secondary)',
	lineHeight: '1.8rem',
	padding: '0 3px',
})

const BADGE_DECORATION_1 = css({
	display: 'flex',
	position: 'absolute',
	width: '14px',
	top: '0',
	left: '0',
	transform: 'translate(-50%, -50%)',
	color: '#18181b',
})

const BADGE_DECORATION_2 = css({
	display: 'flex',
	position: 'absolute',
	width: '14px',
	bottom: '0',
	right: '2px',
	transform: 'translate(50%, 50%)',
	color: '#18181b',
})

export default function badge (data: UserData) {
	let el: HTMLElement | SVGElement
	const wrapper = h(
		'div',
		{ class: 'pronoundb-chat-badge', style: BADGE_WRAPPER },
		el = h(
			'span',
			{ style: BADGE_INNER },
			formatPronounsShort(data.sets.en)
		)
	)

	if (data.decoration) {
		fetchDecoration(data.decoration).then((d) => {
			if (!d) return
			el.style.border = `2px solid ${d.color}`
			wrapper.style.bottom = '0'

			if (d.elements.topLeft) {
				const deco = d.elements.topLeft.cloneNode(true) as SVGElement
				deco.setAttribute('style', BADGE_DECORATION_1)
				el.appendChild(deco)
			}

			if (d.elements.bottomRight) {
				const deco = d.elements.bottomRight.cloneNode(true) as SVGElement
				deco.setAttribute('style', BADGE_DECORATION_2)
				el.appendChild(deco)
			}
		})
	}

	return wrapper
}

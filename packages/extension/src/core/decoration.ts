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

import { h } from '../utils/dom'

export type DecorationData = {
	name: string
	color: string
	elements: {
		topLeft?: SVGElement
		bottomRight?: SVGElement
	}
}

let decorationsEnabled = true
chrome.storage.sync.get([ 'decorations' ], ({ decorations }) => (decorationsEnabled = decorations !== false))
chrome.storage.onChanged.addListener((changes) => (decorationsEnabled = changes.decorations.newValue !== false))

function renderSvg (data: any) {
	return h(
		'svg',
		{ viewBox: data.v },
		...data.p.map((p: any) => h('path', { fill: p.c, d: p.d }))
	)
}

async function doFetch (id: string): Promise<DecorationData | null> {
	const res = await fetch(`https://pronoundb.org/decorations/${id}.json`)
	if (res.status !== 200) return null

	const data = await res.json()
	return {
		name: data.name,
		color: data.color,
		elements: {
			topLeft: data.elements.top_left && renderSvg(data.elements.top_left),
			bottomRight: data.elements.bottom_right && renderSvg(data.elements.bottom_right),
		},
	}
}

const cache = new Map<string, Promise<DecorationData | null>>()
export function fetchDecoration (id: string): Promise<DecorationData | null> {
	if (!decorationsEnabled) return Promise.resolve(null)

	if (!cache.has(id)) {
		const promise = doFetch(id)
		cache.set(id, promise)
		return promise
	}

	return cache.get(id)!
}

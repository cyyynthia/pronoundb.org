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

import type { SvgDefinition, SvgElement } from '@pronoundb/pronouns/decorations'

export type Child = Node | string | null | false
export type Children = Child | Children[]

const SVG = [ 'svg', 'symbol', 'path', 'g' ]

function processChildren (children: Children[], e: Element) {
	for (const child of children) {
		if (Array.isArray(child)) {
			processChildren(child, e)
		} else if (child) {
			e.appendChild(typeof child === 'string' ? document.createTextNode(child) : child)
		}
	}
}

export function h (tag: string, props: Record<string, any> | null, ...children: Children[]): HTMLElement | SVGElement {
	const e = SVG.includes(tag)
		? document.createElementNS('http://www.w3.org/2000/svg', tag)
		: document.createElement(tag)

	if (props) {
		for (const key in props) {
			if (key in props) {
				if (key.startsWith('on')) {
					const event = key.slice(2).toLowerCase()
					e.addEventListener(event, props[key])
				} else {
					e.setAttribute(key, String(props[key]))
				}
			}
		}
	}

	processChildren(children, e)
	return e
}

export function css (style: Record<string, string>): string {
	let res = ''
	for (const prop in style) {
		if (Object.prototype.hasOwnProperty.call(style, prop)) {
			res += `${prop.replace(/[A-Z]/g, (s) => `-${s.toLowerCase()}`)}:${style[prop]};`
		}
	}

	return res
}

function svgGroup (elements: SvgElement[]): Children[] {
	return elements.map((el) => {
		switch (el.t) {
			case 'p':
			case void 0: // Compat with legacy decoration data
				return h('path', { fill: el.c, d: el.d })
			case 'g':
				return h('g', null, svgGroup(el.e))
		}
	})
}

export function svg (def: SvgDefinition): SVGSVGElement {
	return h('svg', { viewBox: def.v }, svgGroup(def.p)) as SVGSVGElement
}

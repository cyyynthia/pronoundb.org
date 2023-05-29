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

import type { APIContext } from 'astro'
import { getCollection, getEntry } from 'astro:content'
import { readFile } from 'fs/promises'
import { XMLParser } from 'fast-xml-parser'

const DECORATION_SVG_ROOT = import.meta.env.DEV
	? new URL('../../assets/decorations/', import.meta.url)
	: new URL('../../../src/assets/decorations/', import.meta.url)

async function loadSvg (resource: string) {
	const svg = await readFile(new URL(resource, DECORATION_SVG_ROOT))
	const parser = new XMLParser({ ignoreAttributes: false })
	const xml = parser.parse(svg).svg

	return {
		v: xml['@_viewBox'],
		p: xml.path.map((p: any) => ({
			c: p['@_fill'],
			d: p['@_d'],
		})),
	}
}

export const prerender = true

export async function getStaticPaths () {
	const decorations = await getCollection('decorations')
	return decorations.map((d) => ({ params: { id: d.id } }))
}

export async function get ({ params: { id } }: APIContext) {
	if (!id) throw new Error('An ID is required!')

	const decorationEntry = await getEntry('decorations', id)
	if (!decorationEntry) throw new Error('Invalid decoration?!')

	const decoration = decorationEntry.data

	return {
		body: JSON.stringify({
			version: decoration.version,
			name: decoration.name,
			color: decoration.color,
			elements: {
				top_left: decoration.elements.top_left && await loadSvg(decoration.elements.top_left),
				bottom_right: decoration.elements.bottom_right && await loadSvg(decoration.elements.bottom_right),
			},
		}),
	}
}

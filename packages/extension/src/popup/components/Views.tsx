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

import type { ExtensionModule } from '../../modules'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'

import Checkbox from './form/Checkbox'
import Select from './form/Select'
import modules from '../../modules'

export const enum ViewState {
	MAIN,
	PRONOUNS,
	SETTINGS
}

export function Unsupported () {
	return (
		<main class='flex-grow p-4 flex flex-col items-center'>
			<p class='font-semibold text-xl text-center m-4 p-4 mt-0 pt-0 border-b border-gray-200'>This website is not supported by PronounDB</p>
		</main>
	)
}

export function Main ({ module }: { module: ExtensionModule }) {
	const enabledKey = `${module.id}.enabled`

	const [ enabled, setEnabled ] = useState(true)
	const onInput = useCallback((val: any) => {
		chrome.storage.sync.set({ [enabledKey]: val })
		setEnabled(val)
	}, [ setEnabled ])

	useEffect(() => {
		chrome.storage.sync.get([ enabledKey ])
			.then((s) => setEnabled(s[enabledKey] ?? true))
	}, [])

	return (
		<main class='flex-grow border-t-8 px-4 py-2 -m-px' style={{ borderColor: module.color }}>
			<div class='flex gap-2 items-center mb-3'>
				{h(module.Icon, { class: 'w-6 h-6 fill-current' })}
				<h2 class='text-xl font-semibold tracking-wide'>{module.name}</h2>
			</div>

			<Checkbox onInput={onInput} name='enabled' value={enabled} label='Enable module'/>
			{/* per-module settings */}
			<p class='text-base'>There are no specific settings for this integration.</p>
		</main>
	)
}

export function Settings () {
	const [ settings, setSettings ] = useState<Record<string, any>>({})
	const onInput = useCallback((val: any, e: Event) => {
		const key = (e.target as any).name
		chrome.storage.sync.set({ [key]: val })
		setSettings((s) => ({ ...s, [key]: val }))
	}, [ setSettings ])

	useEffect(() => {
		chrome.storage.sync.get([ 'pronouns.case', 'decorations', ...modules.map((mdl) => `${mdl.id}.enabled`) ])
			.then((s) => setSettings(s))
	}, [])

	return (
		<main class='flex-grow px-4 py-2'>
			<div class='flex gap-2 items-center mb-2'>
				<h2 class='text-xl font-semibold tracking-wide'>Appearance</h2>
			</div>
			<Select
				onInput={onInput}
				name='pronouns.case'
				value={settings['pronouns.case']}
				options={[ [ 'lower', 'aaa/aaa' ], [ 'pascal', 'Aaa/Aaa' ] ]}
			/>
			<Checkbox
				onInput={onInput}
				name='decorations'
				value={settings.decorations !== false}
				label={
					<div class='flex gap-2 items-center'>
						<span class='bg-blue-300 text-black font-bold text-sm rounded-xl px-2'>BETA</span>
						<span>Enable decorations</span>
					</div>
				}
			/>

			<div class='flex gap-2 items-center mb-3'>
				<h2 class='text-xl font-semibold tracking-wide'>Enabled modules</h2>
			</div>
			{modules.map((mdl) => (
				<Checkbox
					onInput={onInput}
					name={`${mdl.id}.enabled`}
					value={settings[`${mdl.id}.enabled`] ?? true}
					key={mdl.id}
					label={
						<span class='flex gap-2 items-center'>
							{h(mdl.Icon, { class: 'w-4 h-4 fill-current' })} {mdl.name}
						</span>
					}
				/>
			))}
		</main>
	)
}

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

import test from './test.js'
import { expect } from '@playwright/test'

test('Profile shows pronouns', async ({ page }) => {
	await page.goto('https://github.com/cyyynthia')
	await expect(page.locator('.vcard-details >> text=it/its')).toHaveCount(1)
})

test('Followers/following page shows pronouns', async ({ page }) => {
	await page.goto('https://github.com/cyyynthia?tab=followers')
	await expect(page.locator('.Layout-main p >> text=they/them')).toHaveCount(50)
})

test('Hovercard shows pronouns', async ({ page }) => {
	await page.goto('https://github.com/cyyynthia/pronoundb.org')
	await page.locator('[data-hovercard-url="/users/cyyynthia/hovercard"]').first().hover()
	await expect(page.locator('.Popover-message >> text=it/its')).toHaveCount(1)
})

test.describe('Implementation quirks', () => {
	test('Profile pronouns stay when changing tab', async ({ page }) => {
		await page.goto('https://github.com/cyyynthia?tab=stars')
		await page.locator('.UnderlineNav >> text=Overview').first().click()
		await expect(page.locator('.vcard-details >> text=it/its')).toHaveCount(1)
		await page.locator('.UnderlineNav >> text=Stars').first().click()
		await expect(page.locator('.vcard-details >> text=it/its')).toHaveCount(1)
	})
})

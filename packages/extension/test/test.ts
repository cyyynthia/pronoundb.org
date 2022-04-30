/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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

import type { Page } from '@playwright/test'
import { test, chromium } from '@playwright/test'
import { setTimeout as wait } from 'timers/promises'
import { join } from 'path'

const CYNTHIA_IDS = [
  'twitter::1300929324154060800',
  'github::9999055',
]

export default test.extend({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const launchOptions = {
      headless: false,
      args: [ `--disable-extensions-except=${join(__dirname, '..', 'dist')}` ],
    }

    if (!process.argv.includes('--headed')) {
      launchOptions.headless = true
      launchOptions.args.push('--headless=chrome') // https://bugs.chromium.org/p/chromium/issues/detail?id=706008#c36
    }

    const context = await chromium.launchPersistentContext('', launchOptions)

    let ext: Page
    while (!(ext = context.backgroundPages()[0])) await wait(10)

    ext.route('https://pronoundb.org/api/v1/lookup?*', async (route, req) => {
      const params = new URL(req.url()).searchParams
      const id = `${params.get('platform')}::${params.get('id')}`

      await route.fulfill({
        body: JSON.stringify({ pronouns: CYNTHIA_IDS.includes(id) ? 'ii' : 'tt' }),
        contentType: 'application/json',
      })
    })

    ext.route('https://pronoundb.org/api/v1/lookup-bulk?*', async (route, req) => {
      const params = new URL(req.url()).searchParams
      const platform = params.get('platform')
      const ids = params.get('ids')?.split(',') ?? []

      const pronouns: Record<string, string> = {}
      for (const id of ids) {
        pronouns[id] = CYNTHIA_IDS.includes(`${platform}::${id}`) ? 'ii' : 'tt'
      }

      await route.fulfill({
        body: JSON.stringify(pronouns),
        contentType: 'application/json',
      })
    })

    await use(context)
    await context.close()
  },
})

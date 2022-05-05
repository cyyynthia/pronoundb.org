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

import type { LaunchOptions, Page, Project } from '@playwright/test'
import type { TestArgs } from '../playwright.config.js'
import { test as base, chromium } from '@playwright/test'
import { readFile } from 'fs/promises'
import { join, basename } from 'path'

import { TestPronouns } from './data.js'

const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use, testInfo) => {
    const project = testInfo.project as Project<TestArgs>
    const platform = basename(testInfo.file).split('.')[0]
    testInfo.skip(Boolean(project.use.authenticated && !project.use.credentials?.[platform]), 'No credentials available')

    const launchOptions: LaunchOptions = { args: [ `--disable-extensions-except=${join(__dirname, '..', 'dist')}` ] }

    if (testInfo.project.use.headless) {
      launchOptions.args.push('--headless=chrome') // https://bugs.chromium.org/p/chromium/issues/detail?id=706008#c36
    }

    let ext: Page
    const context = await chromium.launchPersistentContext('', launchOptions)
    while (!(ext = context.backgroundPages()[0])) await testInfo.setTimeout(10)

    ext.route('https://pronoundb.org/api/v1/lookup?*', async (route, req) => {
      const params = new URL(req.url()).searchParams
      await route.fulfill({
        body: JSON.stringify({ pronouns: TestPronouns[params.get('platform')]?.[params.get('id')] ?? 'tt' }),
        contentType: 'application/json',
      })
    })

    ext.route('https://pronoundb.org/api/v1/lookup-bulk?*', async (route, req) => {
      const params = new URL(req.url()).searchParams
      const ids = params.get('ids')?.split(',') ?? []
      const pronouns: Record<string, string> = {}
      for (const id of ids) {
        pronouns[id] = TestPronouns[params.get('platform')]?.[id] ?? 'tt'
      }

      await route.fulfill({
        body: JSON.stringify(pronouns),
        contentType: 'application/json',
      })
    })

    if (project.use.authenticated) {
      // https://github.com/microsoft/playwright/issues/7634
      const blob = await readFile(`.testdata/${platform}StorageState.json`, 'utf8')
      context.addCookies(JSON.parse(blob).cookies)
    }

    await use(context)
    await context.close()
  },
})

export default test

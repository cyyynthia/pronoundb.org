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

import type { PlaywrightTestConfig } from '@playwright/test'
import { LoginProcedures } from './testutils/login.js'

export type TestArgs = { authenticated: boolean, credentials: Record<string, boolean> }

const credentials = {}
const authenticated = []
const authenticatedOnly = []
for (const platform in LoginProcedures) {
  if (platform in LoginProcedures) {
    authenticated.push(platform)
    if (LoginProcedures[platform].loggedInOnly) authenticatedOnly.push(platform)

    const username = process.env[`TEST_ACCOUNT_${platform.toUpperCase()}_USERNAME`]
    const password = process.env[`TEST_ACCOUNT_${platform.toUpperCase()}_PASSWORD`]
    const ignore = process.env[`TEST_ACCOUNT_${platform.toUpperCase()}_IGNORE_MISSING_CREDENTIALS`]
    credentials[platform] = Boolean(ignore) || Boolean(username && password)
  }
}

const withoutAuthRegExp = new RegExp(`.*\\/(?!${authenticatedOnly.join('|')})[^/]*\\.test\\.ts`, 'gm')
const withAuthRegExp = new RegExp(`.*(?:${authenticated.join('|')})\\.test\\.ts`, 'gm')

const config: PlaywrightTestConfig<TestArgs> = {
  timeout: 30e3,
  retries: 2,
  globalSetup: require.resolve('./testutils/login.js'),
  forbidOnly: Boolean(process.env.CI),
  projects: [
    {
      name: 'Chromium without authentication',
      testMatch: withoutAuthRegExp,
      use: {
        browserName: 'chromium',
        authenticated: false,
      },
    },
    {
      name: 'Chromium with authentication',
      testMatch: withAuthRegExp,
      use: {
        browserName: 'chromium',
        authenticated: true,
      },
    },
    {
      name: 'Firefox without authentication',
      testMatch: withoutAuthRegExp,
      use: {
        browserName: 'firefox',
        authenticated: false,
      },
    },
    {
      name: 'Firefox with authentication',
      testMatch: withAuthRegExp,
      use: {
        browserName: 'firefox',
        authenticated: true,
      },
    },
  ],
  use: {
    headless: !process.argv.includes('--headed'),
    launchOptions: { devtools: true },
    actionTimeout: 5e3,
    credentials: credentials,
  },
}

export default config

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

import type { Browser } from '@playwright/test'
import { chromium } from '@playwright/test'

type Procedure = {
  loggedInOnly?: boolean
  page: string
  username: string
  next?: string
  password: string
  submit: string
}

export const LoginProcedures: Record<string, Procedure> = {
  twitter: {
    page: 'https://twitter.com/i/flow/login',
    username: 'input[autocomplete="username"]',
    next: 'text=Next',
    password: 'input[name="password"]',
    submit: 'text=Log in',
  },
  discord: {
    loggedInOnly: true,
    page: 'https://discord.com/login',
    username: 'input[name="email"]',
    password: 'input[name="password"]',
    submit: 'text=Login',
  },
}

async function login (browser: Browser, platform: string) {
  const procedure = LoginProcedures[platform]
  const ignoreMissingCreds = process.env[`TEST_ACCOUNT_${platform.toUpperCase()}_IGNORE_MISSING_CREDENTIALS`]
  if (ignoreMissingCreds) return

  const username = process.env[`TEST_ACCOUNT_${platform.toUpperCase()}_USERNAME`]
  const password = process.env[`TEST_ACCOUNT_${platform.toUpperCase()}_PASSWORD`]
  if (!username || !password) {
    console.log('::warning::Authenticated tests for %s will be skipped: no available credentials set.', platform)
    return
  }

  const page = await browser.newPage()
  await page.goto(procedure.page)
  await page.fill(procedure.username, username)
  if (procedure.next) await page.click(procedure.next)
  await page.fill(procedure.password, password)
  await page.click(procedure.submit)
  await page.context().storageState({ path: `.testdata/${platform}StorageState.json` })
}

async function globalSetup () {
  const browser = await chromium.launch()
  await Promise.all(Object.keys(LoginProcedures).map((platform) => login(browser, platform)))
  await browser.close()
}

export default globalSetup

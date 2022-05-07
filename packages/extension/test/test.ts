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
import { test as base, chromium, firefox } from '@playwright/test'
import { readFile } from 'fs/promises'
import { join, basename } from 'path'
import { processRequest } from '../testutils/mock.js'
import RDPConnection from '../testutils/rdp.js'

const PDB_EXT_PATH = join(__dirname, '..', 'dist')
const MOCK_FILE_PATH = join(__dirname, '..', 'testutils', 'mock.ts')

const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  browser: async ({ browserName, headless }, use) => {
    if (browserName === 'chromium') {
      await use(null)
      return
    }

    const browser = await firefox.launch({
      headless: headless,
      args: [ '--start-debugger-server' ],
      firefoxUserPrefs: { 'devtools.debugger.prompt-connection': false },
    })

    const rdp = new RDPConnection()
    const addon = await rdp.installAddon(PDB_EXT_PATH)
    await rdp.waitFor('frameUpdate')

    const mockCodeTs = await readFile(MOCK_FILE_PATH, 'utf8')
    const mockCodeJs = mockCodeTs
      // Remove TS traces
      .replace(/!/g, '')
      .replace(/: (string|any)/g, '')
      .replace('export function', 'function')
      // "Minify" the code
      .replace(/^((.\*| *\/\/).*)?\n/gm, '') // Comments & empty lines
      .replace(/([{,])\n/g, '$1') // Empty lines (no ;)
      .replace(/\n/g, ';') // Empty lines (;)
      .replace(/ {2,}/g, '') // Multi spaces
      .replace(/[ ,]?([=:{}(]|\?\?) ?/g, '$1') // Useless space/symbols

    await rdp.evaluate(
      `${mockCodeJs}\nwindow.fetch = (u) => Promise.resolve({ json: () => Promise.resolve(processRequest(u)) })`,
      addon.consoleActor,
      addon.innerWindowId
    )

    rdp.close()
    await use(browser)
    await browser.close()
  },
  context: async ({ browser, browserName }, use, testInfo) => {
    const project = testInfo.project as Project<TestArgs>
    const platform = basename(testInfo.file).split('.')[0]
    testInfo.skip(Boolean(project.use.authenticated && !project.use.credentials?.[platform]), 'No credentials available')

    if (browserName === 'firefox') {
      const context = await browser.newContext({
        storageState: project.use.authenticated
          ? `.testdata/${platform}StorageState.json`
          : void 0,
      })

      await use(context)
      await context.close()
      return
    }

    const launchOptions: LaunchOptions = {
      args: [
        `--disable-extensions-except=${join(__dirname, '..', 'dist')}`,
        `--load-extension=${join(__dirname, '..', 'dist')}`,
      ],
    }

    if (testInfo.project.use.headless) {
      launchOptions.args.push('--headless=chrome') // https://bugs.chromium.org/p/chromium/issues/detail?id=706008#c36
    }

    let ext: Page
    const context = await chromium.launchPersistentContext('', launchOptions)
    while (!(ext = context.backgroundPages()[0])) await testInfo.setTimeout(10)

    ext.route('https://pronoundb.org/api/v1/lookup*', async (route, req) => {
      await route.fulfill({
        body: JSON.stringify(processRequest(req.url())),
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

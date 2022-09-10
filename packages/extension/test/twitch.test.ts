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

import { Server } from 'ws'
import test from './test.js'
import { expect } from '@playwright/test'

let server: Server
const PORT = 10_000 + Math.round(Math.random() * 10_000)

test.beforeAll(() => {
  server = new Server({ host: 'localhost', port: PORT })
  server.on('connection', (conn) => {
    let nick = ''
    conn.on('message', (msg) => {
      const payload = msg.toString()
      if (payload.startsWith('NICK')) {
        nick = payload.slice(5)
        return
      }

      if (payload.startsWith('JOIN')) {
        const channel = payload.slice(5)
        conn.send(`:${nick}!${nick}@${nick}.tmi.twitch.tv JOIN ${channel}\n`)
        conn.send(`:tmi.twitch.tv ROOMSTATE ${channel}\n`)

        const MSG_PREFIX = '@color=#F49898;user-id=103493295 :cyyynthia_!cyyynthia_@cyyynthia_.tmi.twitch.t\n'
        setTimeout(() => conn.send(`${MSG_PREFIX} PRIVMSG ${channel} :Meow.\n`), 1500)
        setTimeout(() => conn.send(`${MSG_PREFIX} PRIVMSG ${channel} :Meow?\n`), 1750)
        setTimeout(() => conn.send(`${MSG_PREFIX} PRIVMSG ${channel} :Meow!!\n`), 2000)
        return
      }
    })
  })
})

test.afterAll(() => {
  server.close()
})

test.use({
  context: async ({ context }, use) => {
    await context.route(
      /^https:\/\/static\.twitchcdn\.net\/assets\/[a-z]+-[a-f0-9]+\.js$/i,
      async (route, request) => {
        const res = await context.request.fetch(request)
        const body = await res.text()
        await route.fulfill({
          body: body
            .replace('"wss://"', '"ws://"')
            .replace('irc-ws.chat.twitch.tv', `localhost:${PORT}`)
            .replace(',":").concat(this.port)', ')'),
          response: res,
        })
      }
    )

    await use(context)
  },
})

test('About section shows pronouns (main stream page)', async ({ page }) => {
  await page.goto('https://www.twitch.tv/cyyynthia_')
  await page.locator('.home-header-sticky >> text=Chat').click().catch()
  await expect(page.locator('[data-a-target="about-panel"]')).toContainText('it/its')
})

test('About section shows pronouns (about page)', async ({ page }) => {
  await page.goto('https://www.twitch.tv/cyyynthia_/about')
  await expect(page.locator('[data-a-target="about-panel"]')).toContainText('it/its')
})

test('Pronouns shows up in chat', async ({ page }) => {
  await page.goto('https://www.twitch.tv/popout/cyyynthia_/chat')
  await expect(page.locator('[data-a-target="chat-scroller"] >> text=it/its')).toHaveCount(3)
})

test('Viewer card shows up pronouns', async ({ page }) => {
  await page.goto('https://www.twitch.tv/popout/cyyynthia_/chat')
  await page.locator('text=cyyynthia_').first().click()
  await expect(page.locator('.viewer-card')).toContainText('it/its')
})

test('Viewer card shows up pronouns (popped out)', async ({ page }) => {
  await page.goto('https://www.twitch.tv/popout/cyyynthia_/viewercard/cyyynthia_')
  await expect(page.locator('.viewer-card')).toContainText('it/its')
})

test.describe('Implementation quirks', () => {
  // FFZ changes the chat internal structure. Make sure the extension adapts
  test('Pronouns shows up in chat with FFZ', async ({ page }) => {
    await page.goto('https://www.twitch.tv/popout/cyyynthia_/chat')
    await page.evaluate(() => {
      const script = document.createElement('script')
      script.src = `//cdn.frankerfacez.com/script/script.min.js?_=${Date.now()}`
      document.head.appendChild(script)
    })

    await page.waitForLoadState('networkidle')
    await expect(page.locator('[data-a-target="chat-scroller"] >> text=it/its')).toHaveCount(3)
  })
})

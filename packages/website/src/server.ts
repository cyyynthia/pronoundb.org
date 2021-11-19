/*
 * Copyright (c) 2020-2021 Cynthia K. Rey, All rights reserved.
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

/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from 'http'
import { join } from 'path'
import { readFileSync } from 'fs'
import { createServer, get as httpGet } from 'http'
import { createHash } from 'crypto'
import { render } from 'preact-render-to-string'
import { toStatic } from 'hoofd/preact'
import { h, Fragment } from 'preact'

import App from './components/App'
import config from './config.js'

const template = readFileSync(join(__dirname, 'index.html'), 'utf8')

let lastFetch = 0
let usersCount = 0
function fetchUsersCount () {
  if ((Date.now() - lastFetch) > 3600e3) {
    lastFetch = Date.now()
    httpGet(`${config.api}/api/v1/stats`, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chk) => (data += chk))
      res.on('end', () => {
        const stats = JSON.parse(data)
        usersCount = stats.users
      })
    })
  }

  return usersCount
}

function handler (req: IncomingMessage, res: ServerResponse) {
  if (req.method?.toLowerCase() !== 'get') {
    res.writeHead(405, 'method not allowed')
    res.end()
    return
  }

  const count = fetchUsersCount()
  const script = `window.ServerData = { usersCount: ${count} }`
  const hash = createHash('sha256').update(script).digest('base64')

  const ctx: Record<string, any> = { usersCount: count }
  const body = render(h(App, { url: req.url ?? '/', ctx: ctx }))
  if (ctx.notFound) res.writeHead(404, 'Not Found')

  const helmet = toStatic()
  const head = render(h(
    Fragment,
    null,
    h('title', null, helmet.title),
    helmet.metas.map((m) => h('meta', m)),
    helmet.links.map((l) => h('link', l))
  ))

  res.setHeader('content-type', 'text/html')
  res.setHeader('content-security-policy', `default-src 'none'; script-src 'self' 'sha256-${hash}'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' https://avatars.githubusercontent.com;`)
  res.setHeader('permissions-policy', 'interest-cohort=()')
  res.setHeader('referrer-policy', 'no-referrer')
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('x-frame-options', 'DENY')

  res.write(
    template
      .replace('/*ssr-script*/', script)
      .replace('<!--ssr-head-->', head)
      .replace('<!--ssr-body-->', body),
    () => res.end()
  )
}

fetchUsersCount()
createServer(handler).listen(process.env.PORT ?? 8000)

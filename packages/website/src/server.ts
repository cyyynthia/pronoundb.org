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
import { createServer } from 'http'
import { createHash } from 'crypto'
import { render } from 'preact-render-to-string'
import { toStatic } from 'hoofd/preact'
import { h, Fragment } from 'preact'

import App from './components/App'

const template = readFileSync(join(__dirname, 'index.html'), 'utf8')

function handler (req: IncomingMessage, res: ServerResponse) {
  if (req.method?.toLowerCase() !== 'get') {
    res.writeHead(405, 'method not allowed')
    res.end()
    return
  }

  // todo: fetch users count?
  // I guess an internal http call to the API is ok-ish...
  const count = 69
  const script = `window.__USERS_COUNT__ = ${count}`
  const hash = createHash('sha256').update(script).digest('base64')

  const ctx: Record<string, unknown> = {}
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
  res.setHeader('content-security-policy', `default-src \'self\'; script-src \'self\' \'sha256-${hash}\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' https://avatars.githubusercontent.com;`)
  res.setHeader('permissions-policy', 'interest-cohort=()')
  res.setHeader('x-frame-options', 'DENY')

  res.write(
    template
      .replace('/*ssr-script*/', script)
      .replace('<!--ssr-head-->', head)
      .replace('<!--ssr-body-->', body),
    () => res.end()
  )
}

createServer(handler).listen(process.env.PORT ?? 8000)

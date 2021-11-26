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

import type { RestStatsData } from '@pronoundb/shared'
import type { IncomingMessage, ServerResponse } from 'http'
import type Config from '../../../config.example.json'
import { join, dirname } from 'path'
import { existsSync, readFileSync } from 'fs'
import { createServer, get as httpGet } from 'http'
import { createHash } from 'crypto'
import { render } from 'preact-render-to-string'
import { toStatic } from 'hoofd/preact'
import { h, Fragment } from 'preact'

import AppContext from './components/AppContext'
import App from './components/App'

// Read config
let path = dirname(__dirname)
let cfgFile: string | null = null
while (!cfgFile && path !== '/') {
  const attempt = join(path, 'config.json')
  if (existsSync(attempt)) {
    cfgFile = attempt
  } else {
    path = dirname(path)
  }
}

if (!cfgFile) {
  console.log('Unable to locate config file! Exiting.')
  process.exit(1)
}

const blob = readFileSync(cfgFile, 'utf8')
const config = JSON.parse(blob) as typeof Config
const template = readFileSync(join(__dirname, 'index.html'), 'utf8')

let lastFetch = 0
let cachedStats: RestStatsData
function fetchStats () {
  if ((Date.now() - lastFetch) > 3600e3) {
    lastFetch = Date.now()
    httpGet(`${config.api}/api/v1/stats`, (res) => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', (chk) => (data += chk))
      res.on('end', () => (cachedStats = JSON.parse(data)))
    })
  }

  return cachedStats
}

function makeCsp (scriptHash: string) {
  const rules = {
    'default-src': [ '\'self\'' ], // I cannot set default-src to none because furryfox governs <use> exclusively by this. Sigh...
    'img-src': [ '\'self\'', 'https://avatars.githubusercontent.com' ],
    'script-src': [ '\'self\'', `'sha256-${scriptHash}'` ],
    'style-src': [ '\'self\'' ],
    'font-src': [ '\'self\'' ],
    'connect-src': [ '\'self\'' ],

    'child-src': [ '\'none\'' ],
    'frame-src': [ '\'none\'' ],
    'manifest-src': [ '\'none\'' ],
    'media-src': [ '\'none\'' ],
    'object-src': [ '\'none\'' ],
    'worker-src': [ '\'none\'' ],

    'base-uri': [ '\'none\'' ],
    'form-action': [ '\'none\'' ],
    'frame-ancestors': [ '\'none\'' ],
  }

  return Object.entries(rules)
    .map(([ directive, values ]) => `${directive} ${values.join(' ')};`)
    .join(' ')
}

function handler (req: IncomingMessage, res: ServerResponse) {
  if (req.method?.toLowerCase() !== 'get') {
    res.writeHead(405, 'method not allowed')
    res.end()
    return
  }

  const stats = fetchStats()
  const ctx: Record<string, any> = {}
  const data = { ctx: ctx, stats: stats }
  const body = render(h(AppContext.Provider, { value: data, children: h(App, { url: req.url ?? '/' }) }))

  if (ctx.redirect) {
    res.writeHead(302, 'Found')
    res.setHeader('location', ctx.redirect)
    res.write(`Redirecting to ${ctx.redirect}`, () => res.end())
    return
  }

  const script = `window.ServerData = ${JSON.stringify(data)}`
  const hash = createHash('sha256').update(script).digest('base64')

  const helmet = toStatic()
  const head = render(h(
    Fragment,
    null,
    h('title', null, helmet.title),
    helmet.metas.map((m) => h('meta', m)),
    helmet.links.map((l) => h('link', l))
  ))

  res.setHeader('content-type', 'text/html')
  res.setHeader('content-security-policy', makeCsp(hash))
  res.setHeader('permissions-policy', 'interest-cohort=()')
  res.setHeader('referrer-policy', 'no-referrer')
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('x-frame-options', 'DENY')

  if (ctx.notFound) res.writeHead(404, 'Not Found')

  res.write(
    template
      .replace('/*ssr-script*/', script)
      .replace('<!--ssr-head-->', head)
      .replace('<!--ssr-body-->', body),
    () => res.end()
  )
}

fetchStats()
createServer(handler).listen(config.webPort)

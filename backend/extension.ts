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

import fetch from 'node-fetch'

const { extension } = require('../config.json')

async function fetchChrome (): Promise<string> {
  return fetch('https://chrome.google.com/webstore/detail/nblkbiljcjfemkfjnhoobnojjgjdmknf')
    .then((r) => r.text())
    .then((html) => html.match(/itemprop="version" content="([0-9.]+)/)?.[1] ?? 'unknown')
}

async function fetchMozilla (): Promise<string> {
  return fetch(`https://addons.mozilla.org/api/v5/addons/addon/${extension.mozilla}`)
    .then((r) => r.json())
    .then((d) => d.current_version.version)
}

async function fetchEdge (): Promise<string> {
  return fetch(`https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/${extension.edge}`)
    .then((r) => r.json())
    .then((d) => d.version)
}

type ExtensionVersions = { chrome: string, mozilla: string, edge: string }

let cache: ExtensionVersions | null = null
export default async function (): Promise<ExtensionVersions> {
  if (!cache) {
    const [ chrome, mozilla, edge ] = await Promise.all([ fetchChrome(), fetchMozilla(), fetchEdge(), ])
    cache = { chrome: chrome, mozilla: mozilla, edge: edge }
    setTimeout(() => (cache = null), 3600e3)
  }

  return cache!
}

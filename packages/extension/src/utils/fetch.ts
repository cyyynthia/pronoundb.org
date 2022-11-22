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

import type { Deferred } from './deferred'
import { createDeferred } from './deferred'
import { LRUMap } from './lru/lru'

async function doFetch (platform: string, queue: Map<string, Deferred<string>>) {
  queue = new Map(queue) // clone the map

  // Request is done by the background worker to avoid CSP issues.
  // Chromium does let us do the request regardless of the page's CSP, but Firefox doesn't.
  const res = await chrome.runtime.sendMessage({
    kind: 'http',
    target: 'lookup',
    platform: platform,
    ids: Array.from(queue.keys()),
  })

  if (!res.success) {
    console.error('[PronounDB::fetch] Failed to fetch:', res.error)
    for (const v of queue.values()) v.resolve('unspecified')
    return
  }

  for (const k in res.data) {
    if (k in res.data) {
      queue.get(k)?.resolve(res.data[k])
    }
  }
}

type State = { timer: NodeJS.Timer | null, queue: Map<string, Deferred<string>> }
const state: Record<string, State> = {}
async function queueFetch (platform: string, id: string): Promise<string> {
  if (!state[platform]) state[platform] = { timer: null, queue: new Map() }
  const deferred = createDeferred<string>()
  if (!state[platform].timer) {
    state[platform].timer = setTimeout(() => {
      doFetch(platform, state[platform].queue)
      state[platform].timer = null
      state[platform].queue.clear()
    }, 10)
  }

  state[platform].queue.set(id, deferred)
  if (state[platform].queue.size === 50) {
    clearTimeout(state[platform].timer!)
    doFetch(platform, state[platform].queue)
    state[platform].timer = null
    state[platform].queue.clear()
  }

  return deferred.promise
}

const cache = new LRUMap<string, Promise<string>>(5000)
export function fetchPronouns (platform: string, id: string): Promise<string> {
  const key = `${platform}::${id}`
  if (!cache.has(key)) {
    const pronouns = queueFetch(platform, id)
    cache.set(key, pronouns)
    return pronouns
  }

  return cache.get(key)!
}

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

import { createDeferred } from './utils/deferred'
import { fetchReactProp } from './utils/react'

type QueryElement = string | { $find: string, $in: string[] }

// @ts-expect-error
const isFirefox = typeof chrome !== 'undefined' && typeof browser !== 'undefined'
const callbacks = new Map()
let targetId = 0

export function queryRuntime (node: HTMLElement, query: QueryElement[], runtime: string): Promise<any> {
  const target = `${++targetId}`
  node.dataset.pronoundbTargetId = target
  const deferred = createDeferred<any>()
  const id = Math.random().toString(36).slice(2)
  const timeout = setTimeout(() => {
    deferred.resolve(null)
    console.error('[PronounDB::bridge] Invocation timed out after 10 seconds.')
  }, 10e3)

  callbacks.set(id, (v: any) => {
    callbacks.delete(id)
    deferred.resolve(v)
    clearTimeout(timeout)
  })

  window.postMessage({
    source: 'pronoundb',
    payload: {
      action: 'bridge.query',
      runtime: runtime,
      target: target,
      query: query,
      id: id,
    },
  })

  return deferred.promise
}

export function initializeRuntime () {
  if (isFirefox) return // Nothing to init

  // Responses from main world
  window.addEventListener('message', (e) => {
    if (e.source === window && e.data?.source === 'pronoundb') {
      const data = e.data.payload
      if (data.action === 'bridge.result') {
        if (!callbacks.has(data.id)) {
          console.warn('[PronounDB::bridge] Received unexpected bridge result')
          return
        }

        callbacks.get(data.id).call(null, data.res)
      }
    }
  })

  // fixme: need a more stable way to get script
  const script = document.createElement('script')
  script.setAttribute('src', chrome.runtime.getURL(window.__BUILD_CHUNK__.runtime))
  script.setAttribute('type', 'module')
  document.head.appendChild(script)
  script.remove()
}

if (!('extension' in chrome)) {
  window.addEventListener('message', (e) => {
    if (e.source === window && e.data?.source === 'pronoundb') {
      const data = e.data.payload
      if (data.action === 'bridge.query') {
        let res
        const element = document.querySelector<HTMLElement>(`[data-pronoundb-target-id="${data.target}"]`)
        if (element) {
          element.removeAttribute('data-pronoundb-target-id')
          switch (data.runtime) {
            case 'react':
              res = fetchReactProp(element, data.query)
          }
        }

        window.postMessage({
          source: 'pronoundb',
          payload: {
            action: 'bridge.result',
            id: data.id,
            res: res,
          },
        }, e.origin)
      }
    }
  })
}

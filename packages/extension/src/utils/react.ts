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

import { createDeferred } from './deferred'
import { queryRuntime } from '../runtime'

type QueryElement = string | { $find: string, $in: string[] }

const isFirefox = typeof chrome !== 'undefined' && typeof browser !== 'undefined'
const callbacks = new Map()
let targetId = 0

export function queryReactProp (node: HTMLElement, propPath: QueryElement[]): Promise<any> {
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
      target: target,
      props: propPath,
      id: id,
    },
  })

  return deferred.promise
}

export function fetchReactProp (target: HTMLElement, propPath: QueryElement[]): any {
  if (!isFirefox && 'extension' in chrome) return queryRuntime(target, propPath, 'react')
  if (isFirefox) target = target.wrappedJSObject

  const reactKey = Object.keys(target).find((k) => k.startsWith('__reactInternalInstance') || k.startsWith('__reactFiber'))
  if (!reactKey) return []

  let res = (target as any)[reactKey]
  for (const prop of propPath) {
    if (!res) break
    if (typeof prop === 'string') {
      res = res[prop]
      continue
    }

    const queue = [ res ]
    res = null
    while (queue.length) {
      const el = queue.shift()
      if (prop.$find in el) {
        res = el
        break
      }

      for (const p of prop.$in) {
        // eslint-disable-next-line eqeqeq -- Intentional check for undefined & null
        if (p in el && el[p] != null) queue.push(el[p])
      }
    }
  }

  return res
}

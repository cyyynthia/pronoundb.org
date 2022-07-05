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

type QueryElement = string | { $find: string, $in: string[] }

// @ts-ignore
const isFirefox = typeof chrome !== 'undefined' && typeof browser !== 'undefined'
const callbacks = new Map()
let targetId = 0

function bridgeReactStuff (node: HTMLElement, propPath: QueryElement[], args?: any[]): Promise<any> {
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
      args: args,
      id: id,
    },
  }, '*')

  return deferred.promise
}

function doFetchReactProp (target: Element, propPath: QueryElement[]) {
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

function doExecuteReactProp (target: Element, propPath: QueryElement[], args: any[]) {
  const fn = propPath.pop()!
  if (typeof fn !== 'string') throw new Error('invalid query')
  const obj = doFetchReactProp(target, propPath)
  return obj[fn].apply(obj, args)
}

export async function fetchReactProp (node: HTMLElement, propPath: QueryElement[]) {
  if (isFirefox) {
    return doFetchReactProp(node.wrappedJSObject, propPath)
  }

  return bridgeReactStuff(node, propPath)
}

export async function executeReactProp (node: HTMLElement, propPath: QueryElement[], ...args: any[]) {
  if (isFirefox) {
    // @ts-expect-error
    return doExecuteReactProp(node.wrappedJSObject, propPath, cloneInto(args, window))
  }

  return bridgeReactStuff(node, propPath, args)
}

// Inject main context bridge for Chromium
export function initReact () {
  if (!isFirefox) {
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

    const runtime = () => {
      // @ts-ignore
      window.doFetch()
      // @ts-ignore
      window.doExecute()

      window.addEventListener('message', (e) => {
        if (e.source === window && e.data?.source === 'pronoundb') {
          const data = e.data.payload
          if (data.action === 'bridge.query') {
            let res
            const element = document.querySelector(`[data-pronoundb-target-id="${data.target}"]`)
            if (element) {
              element.removeAttribute('data-pronoundb-target-id')
              if (data.args) {
                res = doExecuteReactProp(element, data.props, data.args)
              } else {
                res = doFetchReactProp(element, data.props)
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

    const script = runtime.toString()
      .replace('window.doFetch(),', `${doFetchReactProp.toString()};`)
      .replace('window.doExecute(),', `${doExecuteReactProp.toString()};`)

    const scriptEl = document.createElement('script')
    scriptEl.textContent = `(${script})()`
    document.head.appendChild(scriptEl)
    scriptEl.remove()
  }
}

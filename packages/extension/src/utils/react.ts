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

import { createDeferred } from './deferred'

// @ts-ignore
const isFirefox = typeof chrome !== 'undefined' && typeof browser !== 'undefined'

const pendingInvokes = new Map()

if (!isFirefox) {
  window.addEventListener('message', function (e) {
    if (e.source === window && e.data.source === 'pronoundb') {
      const data = e.data.payload
      if (data.action === 'invoke.result') {
        if (!pendingInvokes.has(data.id)) {
          console.warn('[PronounDB::invoke] Received unexpected invoke result')
          return
        }

        pendingInvokes.get(data.id).call(null, data.res)
      }
    }
  })
}

function invoke (fn: string, ...args: any[]) {
  const deferred = createDeferred<any>()
  const id = Math.random().toString(36).slice(2)
  const timeout = setTimeout(() => {
    deferred.resolve(null)
    console.error('[PronounDB::invoke] Invocation timed out after 10 seconds.')
  }, 10e3)

  pendingInvokes.set(id, (v: any) => {
    pendingInvokes.delete(id)
    deferred.resolve(v)
    clearTimeout(timeout)
  })

  const script = `
    (function () {
      window.postMessage({
        source: 'pronoundb',
        payload: {
          action: 'invoke.result',
          res: (${fn})(${args.map(a => JSON.stringify(a)).join(',')}),
          id: '${id}'
        }
      })
    }())
  `

  const scriptEl = document.createElement('script')
  scriptEl.textContent = script
  document.head.appendChild(scriptEl)
  scriptEl.remove()

  return deferred.promise
}

function doFetchReactProp (targets: string[] | Array<Element | null>, propPath: string[]) {
  if (typeof targets[0] === 'string') {
    targets = (targets as string[]).map((target) => {
      const node = document.querySelector(`[data-pronoundb-target-id="${target}"]`)
      if (node) node.removeAttribute('data-pronoundb-target-id')
      return node
    })
  }

  const elements = targets as Array<Element | null>
  const first = elements.find(Boolean)
  if (!first) return []

  const reactKey = Object.keys(first).find(k => k.startsWith('__reactInternalInstance') || k.startsWith('__reactFiber'))
  if (!reactKey) return []

  let props = []
  for (const element of elements) {
    if (!element) {
      props.push(null)
      continue
    }

    let res = (element as any)[reactKey]
    for (const prop of propPath) res = res?.[prop]
    props.push(res)
  }

  return props
}

function doExecuteReactProp (targets: string[] | Array<Element | null>, propPath: string[], args: any[]) {
  const fn = propPath.pop()!
  const obj = doFetchReactProp(targets, propPath)
  return obj.map((o) => o[fn].apply(o, args))
}

const fetchReactPropFn = doFetchReactProp.toString().replace('doFetchReactProp', '')
const executeReactPropFn = fetchReactPropFn
  .replace('propPath', 'propPath, args')
  .replace('if', 'const fn = propPath.pop(); if')
  .replace('return props', 'return props.map((p) => p[fn](...args))')

let targetId = 0

export async function fetchReactPropBulk (nodes: HTMLElement[], propPath: string[]) {
  if (isFirefox) {
    return doFetchReactProp(nodes.map((node) => node.wrappedJSObject), propPath)
  }

  const targets = nodes.map((node) => node.dataset.pronoundbTargetId = String(++targetId))
  return invoke(fetchReactPropFn, targets, propPath)
}

export async function executeReactPropBulk (nodes: HTMLElement[], propPath: string[], ...args: any[]) {
  if (isFirefox) {
    // @ts-expect-error
    return doExecuteReactProp(nodes.map((node) => node.wrappedJSObject), propPath, cloneInto(args, window))
  }

  const targets = nodes.map((node) => node.dataset.pronoundbTargetId = String(++targetId))
  return invoke(executeReactPropFn, targets, propPath, args)
}

export async function fetchReactProp (node: HTMLElement, propPath: string[]) {
  return fetchReactPropBulk([ node ], propPath).then((res) => res[0])
}

export async function executeReactProp (node: HTMLElement, propPath: string[], ...args: any[]) {
  return executeReactPropBulk([ node ], propPath, ...args).then((res) => res[0])
}

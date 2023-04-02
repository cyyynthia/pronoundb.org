/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
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

import { queryRuntime } from '../runtime'

export type QueryElement = string | { $find: string, $in: string[] }

export function fetchPropUnchecked (target: HTMLElement, propPath: QueryElement[]) {
  let res = target as any
  for (const prop of propPath) {
    if (!res) break
    if (typeof prop === 'string') {
      res = res[prop]
      continue
    }

    const queue = [ res ]
    res = null
    for (let i = 0; i < 1_000 && queue.length; i++) {
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

export function fetchProp (target: HTMLElement, propPath: QueryElement[]) {
  if (import.meta.env.PDB_BROWSER_TARGET === 'chrome') return queryRuntime(target, propPath, 'generic')
  return Promise.resolve(fetchPropUnchecked(target.wrappedJSObject, propPath))
}

export function fetchVueProp (target: HTMLElement, propPath: QueryElement[]): any {
  return fetchProp(target, [ '__vue__', ...propPath ])
}

export function fetchReactProp (target: HTMLElement, propPath: QueryElement[]): any {
  if (import.meta.env.PDB_BROWSER_TARGET === 'chrome' && 'extension' in chrome) return queryRuntime(target, propPath, 'react')
  if (import.meta.env.PDB_BROWSER_TARGET === 'firefox') target = target.wrappedJSObject

  const reactKey = Object.keys(target).find((k) => k.startsWith('__reactInternalInstance') || k.startsWith('__reactFiber'))
  if (!reactKey) {
    return import.meta.env.PDB_BROWSER_TARGET === 'firefox'
      ? Promise.resolve(null)
      : null
  }

  const res = fetchPropUnchecked(target, [ reactKey, ...propPath ])
  return import.meta.env.PDB_BROWSER_TARGET === 'firefox'
    ? Promise.resolve(res)
    : res
}

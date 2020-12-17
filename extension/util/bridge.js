/*
 * Copyright (c) 2020 Cynthia K. Rey, All rights reserved.
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

const pendingInvokes = new Map()

function runAs (js) {
  const script = document.createElement('script')
  script.textContent = js
  document.head.appendChild(script)
  script.remove()
}

let connected = false
export function connect () {
  if (connected) throw new Error('Bridge already connected!')

  connected = true
  window.addEventListener('message', function (e) {
    if (e.source === window && e.data.source === 'pronoundb') {
      const data = e.data.payload
      if (data.action === 'invoke.result') {
        if (!pendingInvokes.has(data.id)) {
          console.warn('[PronounDB] Received unexpected invoke result')
          return
        }

        pendingInvokes.get(data.id).call(null, data.res)
      }
    }
  })
}

export function invoke (fn, ...args) {
  if (!connected) throw new Error('Bridge is not connected!')

  const deferred = createDeferred()
  const id = Math.random().toString(36).slice(2)
  const timeout = setTimeout(() => deferred.resolve(null) | console.error('[PronounDB] Invocation timed out after 10 seconds.'), 10e3)
  pendingInvokes.set(id, v => pendingInvokes.delete(id) | deferred.resolve(v) | clearTimeout(timeout))

  const js = fn.toString().replace(/^function[^\(]+/, 'function')
  const script = `
    (async function () {
      window.postMessage({
        source: 'pronoundb',
        payload: {
          action: 'invoke.result',
          res: await (${js})(${args.map(a => JSON.stringify(a)).join(',')}),
          id: '${id}'
        }
      })
    }())
  `

  runAs(script)
  return deferred.promise
}

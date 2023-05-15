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

import { fetchReactProp } from '../utils/proxy'

export default function () {
  const kOriginalHandler = Symbol('pdb.ttv.original-message-handler')
  const kCustomHandler = Symbol('pdb.ttv.custom-handler')

  window.addEventListener('message', async (e) => {
    if (e.source === window && e.data?.source === 'pronoundb') {
      const data = e.data.payload
      if (data.action === 'ttv.inject-chat') {
        const chat = document.querySelector<HTMLElement>('.chat-list--default')
        if (!chat) return

        const handler = await fetchReactProp(chat, [ { $find: 'messageHandlerAPI', $in: [ 'child', 'memoizedProps', 'sibling' ] }, 'messageHandlerAPI' ])
        if (handler.handleMessage[kCustomHandler]) return

        const ogDesc = Reflect.getOwnPropertyDescriptor(handler, 'handleMessage')!
        Reflect.defineProperty(handler, kOriginalHandler, ogDesc)

        const patchedHandleMessage = (m: any) => {
          if (m?.id && m.user?.userID) {
            window.postMessage({
              source: 'pronoundb',
              payload: {
                action: 'ttv.chat.msg',
                id: m.id,
                user: m.user.userID,
              },
            }, e.origin)
          }

          handler[kOriginalHandler](m)
        }

        // @ts-expect-error
        patchedHandleMessage[kCustomHandler] = true
        Reflect.defineProperty(handler, 'handleMessage', {
          value: import.meta.env.PDB_BROWSER_TARGET !== 'chrome'
            ? cloneInto(patchedHandleMessage, window, { cloneFunctions: true })
            : patchedHandleMessage,
        })

        const messages = await fetchReactProp(chat, [ { $find: 'messagesHash', $in: [ 'child', 'memoizedProps', 'sibling' ] }, 'messagesHash' ])
        for (const m of messages) {
          if (m.user) m.id = `${m.user.userID}::${m.id}`
        }
      }
    }
  })
}

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

import { Server } from 'ws'

export type IrcServer = Server

// Mock IRC WS server for Twitch unit tests
export default function makeIrcServer (port: number) {
  const server = new Server({ host: 'localhost', port: port })
  server.on('connection', (conn) => {
    let nick = ''
    conn.on('message', (msg) => {
      const payload = msg.toString()
      if (payload.startsWith('NICK')) {
        nick = payload.slice(5)
        return
      }

      if (payload.startsWith('JOIN')) {
        const channel = payload.slice(5)
        conn.send(`:${nick}!${nick}@${nick}.tmi.twitch.tv JOIN ${channel}\n`)
        conn.send(`:tmi.twitch.tv ROOMSTATE ${channel}\n`)

        const MSG_PREFIX = '@color=#F49898;user-id=103493295 :cyyynthia_!cyyynthia_@cyyynthia_.tmi.twitch.t\n'
        setTimeout(() => conn.send(`${MSG_PREFIX} PRIVMSG ${channel} :Meow.\n`), 1500)
        setTimeout(() => conn.send(`${MSG_PREFIX} PRIVMSG ${channel} :Meow?\n`), 1750)
        setTimeout(() => conn.send(`${MSG_PREFIX} PRIVMSG ${channel} :Meow!!\n`), 2000)
        return
      }
    })
  })

  return server
}

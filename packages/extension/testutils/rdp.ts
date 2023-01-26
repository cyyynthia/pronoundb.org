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

import type { Socket } from 'net'
import { EventEmitter } from 'events'
import { setTimeout as wait } from 'timers/promises'
import { connect } from 'net'

export type AddonInstallResponse = {
  addonId: string
  innerWindowId: string
  consoleActor: string
}

export default class RDPConnection {
  #connection: Socket

  #payloads: EventEmitter

  #actors: Record<string, string> = {}

  constructor (port: number) {
    this.#payloads = new EventEmitter()
    this.#connection = connect(port, '127.0.0.1')
    this.#connection.on('data', (buf) => {
      let cursor = 0
      const blob = buf.toString()
      while (cursor < blob.length) {
        const sepIdx = blob.indexOf(':')
        const dataStart = sepIdx + 1
        const dataLength = Number(blob.slice(0, sepIdx))
        cursor += dataStart + dataLength

        const data = blob.slice(dataStart, dataStart + dataLength)
        const payload = JSON.parse(data)
        this.#payloads.emit(payload.type || '*', payload)
      }
    })

    this.#payloads.once('*', () => {
      this.#send({ to: 'root', type: 'getRoot' })
        .then((actors) => (this.#actors = actors))
    })
  }

  async installAddon (path: string): Promise<AddonInstallResponse> {
    while (!this.#actors.addonsActor) await wait(100)

    const installRes = await this.#send({
      to: this.#actors.addonsActor,
      type: 'installTemporaryAddon',
      addonPath: path,
    })

    await wait(50)
    const installedAddons = await this.#send({ to: 'root', type: 'listAddons' })
    const addon = installedAddons.addons.find((a: any) => a.id === installRes.addon.id)

    const target = await this.#send({ to: addon.actor, type: 'getTarget' })
    return {
      addonId: addon.manifestURL.slice(16, 52),
      innerWindowId: target.form.innerWindowId,
      consoleActor: target.form.consoleActor,
    }
  }

  async evaluate (code: string, consoleActor: string, windowId: string): Promise<void> {
    await this.#send({
      to: consoleActor,
      type: 'evaluateJSAsync',
      innerWindowID: windowId,
      text: code,
      url: 'rdp client',
      frameActor: '',
      selectedNodeActor: '',
      selectedObjectActor: '',
    }, 'evaluationResult')
  }

  async waitFor (event: string) {
    return new Promise((resolve) => {
      this.#payloads.once(event, resolve)
    })
  }

  close () {
    this.#connection.end()
  }

  async #send (payload: any, responseType: string = '*'): Promise<any> {
    return new Promise<any>((resolve) => {
      const data = JSON.stringify(payload)
      this.#connection.write(`${data.length}:${data}`)
      this.#payloads.once(responseType, resolve)
    })
  }
}

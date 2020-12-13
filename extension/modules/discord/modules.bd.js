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

import { extractFromFlux, extractUserPopOut, extractUserProfileBody, extractUserProfileInfo } from './modules.shared'
import { fetchPronouns, symbolHttp } from '../../fetch'
fetchPronouns[symbolHttp] = function (url) {
  return new Promise(resolve => {
    require('https').get(url, res => {
      let data = ''
      res.setEncoding('utf8')
      res.on('data', d => data += d)
      res.on('end', () => resolve(JSON.parse(data)))
    })
  })
}

const injections = []
export function inject (mdl, meth, repl) {
  injections.push(
    BdApi.monkeyPatch(mdl, meth, {
      after: ({ thisObject, methodArguments, returnValue }) => repl.call(thisObject, methodArguments, returnValue)
    })
  )
}

export function exporter (exp) {
  class PronounDB {
    getName () { return 'PronounDB' }
    getVersion () { return '0.0.0-unknown' }
    getAuthor () { return 'Cynthia' }
    getDescription () { return 'PronounDB plugin for BetterDiscord - Shows other\'s people pronouns in chat, so your chances of mis-gendering them is low. Service by pronoundb.org' }

    start () {
      exp({
        get: (k, d) => BdApi.loadData(this.getName(), k) ?? d,
        set: (k, v) => BdApi.saveData(this.getName(), k, v)
      })
    }

    stop () {
      injections.forEach(i => i())
      const MessageHeader = BdApi.findModuleByProps('MessageTimestamp')
      MessageHeader.default = MessageHeader.default.MessageHeader
    }
  }

  module.exports = PronounDB
}

export async function getModules () {
  const UserProfile = BdApi.findModuleByDisplayName('UserProfile')
  const fnUserPopOut = BdApi.findModuleByDisplayName('UserPopout')
  const FluxAppearance = BdApi.findModuleByDisplayName('FluxContainer(UserSettingsAppearance)')
  const MessageHeader = BdApi.findModuleByProps('MessageTimestamp')
  const UserProfileBody = extractUserProfileBody(UserProfile)

  return {
    React: BdApi.React,
    MessageHeader,
    UserProfileBody,
    UserProfileInfo: extractUserProfileInfo(UserProfileBody),
    UserPopOut: extractUserPopOut(BdApi.React, fnUserPopOut),
    AppearanceSettings: extractFromFlux(FluxAppearance)
  }
}

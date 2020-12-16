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

import { Plugin } from 'powercord/entities'
import { get as porkordFetch } from 'powercord/http'
import { inject as porkordInject, uninject as porkordUninject } from 'powercord/injector'
import { React, getModule, getModuleByDisplayName } from 'powercord/webpack'
import { SwitchItem } from 'powercord/components/settings'
import { FormNotice } from 'powercord/components'

import { extractMessages, extractUserPopOut, extractUserProfileBody, extractUserProfileInfo } from './modules.shared'
import { fetchPronouns, fetchPronounsBulk } from '../../util/fetch'
import { WEBSITE, Endpoints } from '../../shared.ts'

function doReq (url) {
  return porkordFetch(url)
    .set('x-pronoundb-source', 'Powercord (v0.0.0-unknown)')
    .then(r => r.body)
    .catch(() => ({}))
}

fetchPronouns.__customFetch = (platform, id) => doReq(Endpoints.LOOKUP(platform, id))
fetchPronounsBulk.__customFetch = (platform, ids) => doReq(Endpoints.LOOKUP_BULK(platform, ids))

const injections = []
export function inject (mdl, meth, repl) {
  const iid = `pronoundb-${mdl.constructor.displayName || mdl.constructor.name}-${meth}`
  porkordInject(iid, mdl, meth, repl)
  injections.push(iid)
}

const Settings = React.memo(
  function ({ getSetting, toggleSetting }) {
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(
        FormNotice,
        {
          type: 'cardPrimary',
          className: 'marginBottom20-32qID7',
          body: React.createElement(
            React.Fragment,
            null,
            'To set your pronouns, go to ',
            React.createElement('a', { href: WEBSITE, target: '_blank' }, WEBSITE),
            ' and link your Discord account.'
          )
        },
      ),
      React.createElement(
        SwitchItem,
        { value: getSetting('showInChat', true), onChange: () => toggleSetting('showInChat', true),  },
        'Show pronouns in chat'
      )
    )
  }
)

export function exporter (exp) {
  class PronounDB extends Plugin {
    startPlugin () {
      powercord.api.settings.registerSettings(this.entityID, {
        category: this.entityID,
        label: 'PronounDB',
        render: Settings
      })

      exp({
        get: (k, d) => this.settings.get(k, d),
        set: (k, v) => this.settings.set(k, v)
      })
    }

    pluginWillUnload () {
      powercord.api.settings.unregisterSettings(this.entityID);
      injections.forEach(i => porkordUninject(i))
    }
  }

  module.exports = PronounDB
}

export async function getModules () {
  const fnMessagesWrapper = await getModule(m => m.type?.toString().includes('getOldestUnreadMessageId'))
  const UserProfile = await getModuleByDisplayName('UserProfile')
  const fnUserPopOut = await getModuleByDisplayName('UserPopout')
  const MessageHeader = await getModule([ 'MessageTimestamp' ])
  const UserProfileBody = extractUserProfileBody(UserProfile)

  return {
    React,
    Messages: extractMessages(React, fnMessagesWrapper.type),
    MessageHeader,
    UserProfileBody,
    UserProfileInfo: extractUserProfileInfo(UserProfileBody),
    UserPopOut: extractUserPopOut(React, fnUserPopOut)
  }
}

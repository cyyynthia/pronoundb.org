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

import { compareSemver } from './util/format.js'
import { Endpoints, Platforms, WEBSITE } from './shared.ts'

chrome.runtime.onInstalled.addListener(({ previousVersion, reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({ url: `${WEBSITE}/onboarding` })
  } else if (reason === 'update') {
    const { version } = chrome.runtime.getManifest()
    const keys = Object.keys(Platforms)
    const newPlatforms = keys.filter(
      (key) =>
        compareSemver(previousVersion, Platforms[key].since) === -1 &&
        compareSemver(version, Platforms[key].since) !== -1
    )

    chrome.storage.local.set(Object.fromEntries(newPlatforms.map((p) => [ `new.${p}`, true ])))
  }
})

chrome.runtime.onMessage.addListener(
  function (request, _, sendResponse) {
    if (request.kind === 'http') {
      const url = request.target === 'lookup'
        ? Endpoints.LOOKUP(request.platform, request.id)
        : Endpoints.LOOKUP_BULK(request.platform, request.ids)

      fetch(url, { headers: { 'x-pronoundb-source': 'Extension' } })
        .then((r) => r.json())
        .then((d) => sendResponse({ success: true, data: d }))
        .catch((e) => sendResponse({ success: false, error: e }))

      return true
    }
  }
)

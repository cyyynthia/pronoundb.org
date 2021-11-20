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

import browser from 'webextension-polyfill'
import { Endpoints, WEBSITE } from '@pronoundb/shared/constants.js'

browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({ url: `${WEBSITE}/onboarding` })
  }

  if (details.reason === 'update') {
    const prev = details.previousVersion!.split('.').map(Number)
    if (prev[0] === 0 && prev[1] < 6) {
      browser.tabs.create({ url: `${WEBSITE}/changelog/2021-11` })
    }
  }
})

browser.runtime.onMessage.addListener((request) => {
  if (request.kind === 'http') {
    const url = request.target === 'lookup'
      ? Endpoints.LOOKUP(request.platform, request.id)
      : Endpoints.LOOKUP_BULK(request.platform, request.ids)

    return fetch(url, { headers: { 'x-pronoundb-source': `WebExtension/${browser.runtime.getManifest().version}` } })
      .then((r) => r.json())
      .then((d) => ({ success: true, data: d }))
      .catch((e) => ({ success: false, error: e }))
  }
})

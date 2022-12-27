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

import { Endpoints, WEBSITE } from '@pronoundb/shared/constants.js'

// ONBOARDING & CHANGE LOGS
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.tabs.create({ url: `${WEBSITE}/onboarding` })
  }

  if (details.reason === 'update') {
    // const prev = details.previousVersion!.split('.').map(Number)
    // if (prev[0] === 0 && prev[1] < 6) {
    //   chrome.tabs.create({ url: `${WEBSITE}/changelog/2021-11` })
    // }
  }
})

// HTTP HANDLER
chrome.runtime.onMessage.addListener((request, _, cb) => {
  if (request.kind === 'http') {
    const url = request.ids.length === 1
      ? Endpoints.LOOKUP(request.platform, request.ids[0])
      : Endpoints.LOOKUP_BULK(request.platform, request.ids)

    fetch(url, { headers: { 'x-pronoundb-source': `WebExtension/${import.meta.env.PDB_EXT_VERSION}` } })
      .then((r) => r.json())
      .then((d) => cb({ success: true, data: request.ids.length === 1 ? { [request.ids[0]]: d.pronouns } : d }))
      .catch((e) => cb({ success: false, error: e }))

    return true
  }
})

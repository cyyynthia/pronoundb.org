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

import { log, warn } from '../util/log.js'
import { WEBSITE } from '../shared.ts'

export function run () {
  if (location.pathname === '/v9.0/dialog/oauth') {
    const search = new URLSearchParams(location.search)
    if (!search.get('state') || search.get('state').includes(';;;')) return

    const redirectOrigin = new URL(search.get('redirect_uri')).origin
    if (redirectOrigin === WEBSITE) {
      log('Detected OAuth flow for PronounDB')
      const el = document.querySelector('[id^="profile_pic_header_"')
      if (!el) {
        warn('Failed to find the Real User ID. Authentication flow will fail.')
        return
      }

      const id = el.id.slice(19)
      search.set('state', `${search.get('state')};;;${btoa(id).replace(/=/g, '')}`)
      location.search = `?${search.toString()}`
    }

    return
  }
}

export const match = /^https:\/\/(.+\.)?facebook\.com/

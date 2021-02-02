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

import { Platforms } from './shared.ts'

const updateSetting = (e) => chrome.storage.sync.set({ [e.target.id]: e.target.checked })

/* Generate UI */
function createPlatformItem (platform) {
  const div = document.createElement('div')
  const input = document.createElement('input')
  const label = document.createElement('label')

  div.className = 'form-checkbox'
  input.type = 'checkbox'
  input.checked = true
  input.id = `${platform}.enabled`
  input.addEventListener('change', updateSetting)
  label.setAttribute('for', `${platform}.enabled`)
  label.innerText = Platforms[platform].name

  div.appendChild(label)
  div.appendChild(input)
  return div
}

const container = document.getElementById('platforms-container')
Object.keys(Platforms).filter((p) => !Platforms[p].soon || process.env.NODE_ENV === 'development')
  .forEach((p) => container.appendChild(createPlatformItem(p)))

const stylingSelector = document.querySelector('#pronouns-styling')
stylingSelector.addEventListener('change', (e) => chrome.storage.sync.set({ styling: e.target.value }))

document.getElementById('version-container').innerText = chrome.runtime.getManifest().version

chrome.storage.sync.get(
  [ 'styling', ...Object.keys(Platforms).map((p) => `${p}.enabled`) ],
  ({ styling, ...settings }) => {
    stylingSelector.value = styling ?? 'lower'

    for (const key in settings) {
      if (Object.prototype.hasOwnProperty.call(settings, key) && settings[key] === false) {
        document.getElementById(key).checked = false
      }
    }
  }
)

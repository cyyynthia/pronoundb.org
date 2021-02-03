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

import modules from './modules/index.js'
import { h, css } from './util/dom.js'
import { debug, log } from './util/log.js'
import { Platforms, WEBSITE } from './shared.ts'

for (const platform in modules) {
  if (Object.prototype.hasOwnProperty.call(modules, platform)) {
    const module = modules[platform]
    if (module.match.test(location.href)) {
      if (module.alwaysRun) module.alwaysRun()

      chrome.storage.sync.get([ `${platform}.enabled` ], (res) => {
        if (res[`${platform}.enabled`] ?? true) {
          log(`Enabling ${Platforms[platform].name} module`)
          module.run()
        } else {
          debug(`Skipping ${Platforms[platform].name} module`)
        }
      })

      chrome.storage.sync.get([ 'noPopup' ], ({ noPopup }) => {
        chrome.storage.local.get([ `new.${platform}` ], (res) => {
          if (res[`new.${platform}`]) {
            chrome.storage.local.set({ [`new.${platform}`]: false })
            if (noPopup) return

            const doc = chrome.runtime.getURL('supported.html')
            const iframe = h(
              'iframe',
              {
                src: `${doc}?platform=${encodeURIComponent(Platforms[platform].name)}`,
                style: css({
                  width: '360px',
                  position: 'fixed',
                  top: '24px',
                  right: '24px',
                  border: '0',
                  borderRadius: '8px',
                  transition: 'all .3s',
                  boxShadow: 'rgba(0, 0, 0, .4) 0 0 10px 3px',
                  transform: 'translateY(-24px)',
                  opacity: '0',
                  zIndex: '9999',
                })
              }
            )

            document.body.appendChild(iframe)

            function onMessage (e) {
              if (e.source === iframe.contentWindow && e.data.msg === 'pronoundb::supported::close') {
                window.removeEventListener('message', onMessage)
                iframe.remove()
              }

              if (e.source === iframe.contentWindow && e.data.msg === 'pronoundb::supported::height') {
                iframe.style.height = `${e.data.height}px`
                iframe.style.transform = ''
                iframe.style.opacity = '1'
              }
            }

            window.addEventListener('message', onMessage)
          }
        })
      })
    }
  }
}

if (location.origin === WEBSITE) {
  chrome.storage.sync.get([ 'styling' ], ({ styling }) => {
    window.postMessage({
      source: 'pronoundb',
      payload: {
        action: 'settings.styling',
        styling: styling
      }
    }, '*')
  })

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.styling) {
      window.postMessage({
        source: 'pronoundb',
        payload: {
          action: 'settings.styling',
          styling: changes.styling.newValue
        }
      }, '*')
    }
  })

  if (typeof chrome !== 'undefined' && typeof browser !== 'undefined') {
    window.wrappedJSObject.__PRONOUNDB_EXTENSION_VERSION__ = chrome.runtime.getManifest().version
  } else {
    const s = document.createElement('script')
    s.textContent = `window.__PRONOUNDB_EXTENSION_VERSION__ = '${chrome.runtime.getManifest().version}'`
    document.head.appendChild(s)
    s.remove()
  }
}

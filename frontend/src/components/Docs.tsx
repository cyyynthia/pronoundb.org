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

import { h, Fragment } from 'preact'
import { useTitle } from 'hoofd/preact'
import type { RoutableProps } from 'preact-router'

import { Supported, Pronouns } from '@shared'

const SupportedFragment = () => {
 const items = Supported.map(s => [ <code>{s}</code>, ', ' ])
 items[items.length - 2][1] = ', or '
 items[items.length - 1][1] = ''
 return h(Fragment, null, ...items)
}

function Docs (_: RoutableProps) {
  useTitle('API Docs')

  return (
    <div>
      <div className='page-context'>Developers</div>
      <h2>API Documentation</h2>
      <h3>Types</h3>
      <div>
        <b>Platform:</b> <SupportedFragment/>
      </div>
      <div>
        <b>Pronouns:</b> Short identifier for a set of pronouns. Here are the valid identifiers:
        <ul>
          <li><code>unspecified</code>: Unspecified</li>
          {Object.entries(Pronouns).map(([ id, pronouns ]) => <li key={id}><code>{id}</code>: {pronouns}</li>)}
        </ul>
      </div>
      <h3>Lookup an account</h3>
      <div>
        <p>GET /api/v1/lookup?platform=&lt;platform&gt;&amp;id=&lt;id&gt;</p>
        <ul>
          <li><b>platform</b>: Either <SupportedFragment/></li>
          <li><b>id</b>: Account ID (not the username!)</li>
        </ul>
      </div>

      <h3>Lookup accounts in bulk</h3>
      <div>
        <p>GET /api/v1/lookup-bulk?platform=&lt;platform&gt;&amp;ids=&lt;ids&gt;</p>
        <p>Note: you can only lookup multiple account for a single platform.</p>
        <ul>
          <li><b>platform</b>: Either <SupportedFragment/></li>
          <li><b>ids</b>: Comma-separated Account IDs, will be cropped to 50 max</li>
        </ul>
      </div>
    </div>
  )
}

Docs.displayName = 'Docs'
export default Docs

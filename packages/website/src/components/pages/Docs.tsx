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

// todo: New API & rewrite

import type { Attributes } from 'preact'
import { h, Fragment } from 'preact'
import { useTitle, useMeta } from 'hoofd/preact'
import { PlatformIds, Platforms, Pronouns } from '@pronoundb/shared'
import { usePronouns, formatPronouns } from '../../pronouns'

const SupportedFragment = () => {
  const items = PlatformIds.filter((p) => !Platforms[p].soon).map((platformId) => [
    <code className='px-1 bg-gray-200 dark:bg-gray-700'>{platformId}</code>,
    ', ',
  ])
  items[items.length - 2][1] = ', or '
  items[items.length - 1][1] = ''
  return h(Fragment, null, ...items)
}

export default function Docs (_: Attributes) {
  usePronouns()
  useTitle('API Docs')
  useMeta({ name: 'og:title', content: 'API Docs' })

  return (
    <main className='container-main'>
      <div className='title-context'>About PronounDB</div>
      <h2 className='text-2xl font-bold mb-2'>API Documentation</h2>
      <div className='mb-4 bg-blue-300 font-semibold p-4'>
        This will be rewritten soon, with a better look and a new API that includes new features. Stay tuned!
      </div>

      <h3 className='text-xl font-bold mb-2'>Types</h3>
      <div>
        <b className='bold'>Platform:</b> <SupportedFragment/>
      </div>
      <div className='mb-6'>
        <b className='bold'>Pronouns:</b> Short identifier for a set of pronouns. Here are the identifiers recognized by PronounDB:
        <ul className='list-inside list-disc'>
          {Object.keys(Pronouns).map((setId) => (
            <li key={setId}>
              <code>{setId}</code>: {formatPronouns(setId) ?? 'Unspecified'}
            </li>
          ))}
        </ul>
      </div>
      <h3 className='text-xl font-bold mb-2'>Lookup an account</h3>
      <div className='mb-6'>
        <p>GET /api/v1/lookup</p>
        <p>Query parameters</p>
        <ul className='list-inside list-disc'>
          <li><b className='bold'>platform</b>: A supported platform as described above</li>
          <li><b className='bold'>id</b>: Account ID on the platform</li>
        </ul>
        <p>Response: 404 if not found, 200 otherwise with the following payload</p>
        <ul>
          <li><b>pronouns</b>: Short identifier as defined above</li>
        </ul>
      </div>

      <h3 className='text-xl font-bold mb-2'>Lookup accounts in bulk</h3>
      <div className='mb-6'>
        <p>GET /api/v1/lookup-bulk</p>
        <p>Note: you can only lookup multiple account for a single platform.</p>
        <p>Query parameters</p>
        <ul className='list-inside list-disc'>
          <li><b className='bold'>platform</b>: A supported platform as described above</li>
          <li><b className='bold'>ids</b>: Comma-separated Account IDs, will be cropped to 50 max</li>
        </ul>
        <p>Response: A map of IDs with their corresponding set of pronouns. IDs not found will not be included.</p>
      </div>
    </main>
  )
}

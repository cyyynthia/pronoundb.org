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

import { h } from 'preact'
import { useTitle } from 'hoofd/preact'
import type { RoutableProps } from 'preact-router'

function Privacy (_: RoutableProps) {
  useTitle('Privacy Policy')

  return (
    <div className='justified'>
      <div className='page-context'>Legal</div>
      <h2>Privacy Policy</h2>
      <p>Last edited: December 12, 2020</p>

      <p>
        pronoundb.org automatically collect various metadata sent by your web browser: IP address, browser information,
        operating system information, timestamp of your visits, pages visited. This data is only kept for seven days
        and is only used for debugging and troubleshooting purposes. None of this data will be ever shared or sold.
      </p>
      <p>
        pronoundb.org lets you connect to external accounts using the OAuth 2.0 authentication standard. When
        connecting, pronoundb.org will collect the external account's unique identifier, as well as the account
        name. You may require the removal of this data directly on the website, by pressing the "Unlink" button
        next to them, in "My account".
      </p>
      <p>
        pronoundb.org lets you submit some data through the website. All of the data you submit will be collected and
        stored. You may update it at any time on the website.
      </p>
      <p>
        You may request the entire removal of your data from pronoundb.org's servers by deleting your account. Your
        data will be dropped immediately, but may still live for an additional thirty days on our servers in the
        form of database backups.
      </p>
      <p>
        Those policies may be revised at any time and your continued use of the service will be regarded as acceptance
        of the new policies.
      </p>
    </div>
  )
}

Privacy.displayName = 'Privacy'
export default Privacy

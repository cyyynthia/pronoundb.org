/*
 * Copyright (c) Cynthia Rey, All rights reserved.
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

import type { Attributes } from 'preact'
import { h } from 'preact'
import { useTitle } from 'hoofd/preact'

export default function Privacy (_: Attributes) {
  useTitle('Privacy Policy')

  return (
    <main class='container-main'>
      <div class='title-context'>Legal</div>
      <h2 class='text-2xl font-bold mb-2'>Privacy Policy</h2>
      <p class='mb-4'>Last edited: June 18, 2021</p>
      <div class='text-justify'>
        <p class='mb-3'>
          pronoundb.org automatically receives and collects various metadata sent by your web browser: IP address,
          browser information, operating system information, timestamp of your visits, pages visited. This data is only
          kept for seven days and is only used for debugging, troubleshooting and counter-abuse purposes. None of this
          data, or any other data we may collect, will be ever sold to anyone.
        </p>
        <p class='mb-3'>
          In the event one or more users are found to abuse the pronoundb.org website, we reserve the right to
          indefinitely store IP addresses and various other metadata for counter-abuse. We also reserve the right
          to store aggregated and non-personal information about how the service is used, in the intent to improve it.
        </p>
        <p class='mb-3'>
          pronoundb.org lets you connect to external accounts using the OAuth authentication standard. When connecting
          an external account, pronoundb.org will collect the external account's unique identifier, as well as the
          account's display name on the external platform. You may require the removal of this data directly on the
          website, at any time.
        </p>
        <p class='mb-3'>
          You may during your use of pronoundb.org be invited to input personal information, such as for example
          regarding your gender identity. By submitting any information on the website, you consent to your data to
          be stored, processed and redistributed by pronoundb.org to provide its service. You can update or remove any
          information at any time on the website.
        </p>
        <p class='mb-3'>
          pronoundb.org allows third parties to use identifiers from external platform to lookup information about you.
          This includes any information you've entered, excluding other external accounts you linked. Third parties
          will not be able to directly enumerate external accounts owned by a single person.
        </p>
        <p class='mb-3'>
          pronoundb.org may distribute aggregated information, such as the total user count or some statistics about
          website usage, or percentages about the user repartition. In all cases, pronoundb.org will never specify who
          is or may be included in aggregated information.
        </p>
        <p class='mb-3'>
          You may request the entire removal of your data from pronoundb.org's servers by deleting your account. Your
          data will be deleted immediately, but may still live for an additional thirty days on our servers in the form
          of database backups that are kept to protect the service from data loss.
        </p>
        <p>
          These policies may be revised at any time and your continued use of the service will be regarded as acceptance
          of the new policies.
        </p>
      </div>
    </main>
  )
}

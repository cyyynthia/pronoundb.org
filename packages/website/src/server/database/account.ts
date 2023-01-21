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

import type { ObjectId } from 'mongodb'
import database from './database.js'

const collection = database.collection<Account>('accounts')

export type Account = {
  pronouns: string
  accounts: ExternalAccount[]
}

export type ExternalAccount = {
  id: string
  name: string
  platform: string
}

export async function createAccount (from: ExternalAccount) {
  const existingAccount = await findByExternalAccount(from)
  if (existingAccount) return null

  const result = await collection.insertOne({ accounts: [ from ], pronouns: 'unspecified' })
  return result.insertedId
}

export async function findById (id: ObjectId) {
  return collection.findOne({ _id: id })
}

export async function findByExternalAccount (external: ExternalAccount) {
  // Find and also update account's display name in one go
  // This isn't efficient as it requires a write lock every time but I frankly do not care
  // Future Cynthia, if you're mad know you were already mad at this back when you wrote it you dumbcat
  // -- Cynthia
  const result = await collection.findOneAndUpdate(
    { 'accounts.id': external.id, 'accounts.platform': external.platform },
    { $set: { 'accounts.$[account].name': external.name } },
    { arrayFilters: [ { 'account.platform': external.platform, 'account.id': external.id } ] }
  )

  return result.value
}

export async function addLinkedAccount (userId: ObjectId, account: ExternalAccount) {
  await collection.updateOne({ _id: userId }, { $push: { accounts: account } })
}

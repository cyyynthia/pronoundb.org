/*
 * Copyright (c) Cynthia Rey et al., All rights reserved.
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

// Script to migrate data from Mongo to Postgres

import { MongoClient } from 'mongodb'
import postgres from 'postgres'

function transformId (id) {
	const timestamp = (parseInt(id.slice(0, 8), 16) * 1e3).toString(16).padStart(12, '0')
	return `${timestamp.slice(0, 8)}-${timestamp.slice(8)}-736c-aa79-${id.slice(12, 24)}`
}

const sql = postgres()
const client = new MongoClient(process.env.MONGO_DSN)
await client.connect()

let count = 0
for await (const account of client.db().collection('accounts').find()) {
	const newId = transformId(account._id.toString())
	await sql.begin(async (tx) => {
		await tx`
			INSERT INTO users (id, decoration, available_decorations)
			VALUES (${newId}, ${account.decoration}, ${account.availableDecorations})
		`

		for (const acc of account.accounts) {
			await tx`
				INSERT INTO accounts (platform, account_id, account_name, user_id)
				VALUES (${acc.platform}, ${acc.id}, ${acc.name}, ${newId})
			`
		}

		for (const locale in account.sets) {
			if (locale in account.sets) {
				await tx`
					INSERT INTO pronouns (user_id, locale, sets)
					VALUES (${newId}, ${locale}, ${account.sets[locale]})
				`
			}
		}
	})

	count++
}

console.log('done, migrated %d accounts', count)
client.close()
sql.end()

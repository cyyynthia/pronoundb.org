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

/* oxlint-disable no-new */

import { register, collectDefaultMetrics, Counter, Histogram, Gauge, Summary } from 'prom-client'
import { countUsers, countAccountsPerPlatform } from '@server/database/count.js'
import { providers } from './oauth/providers.js'

if (import.meta.env.DEV) {
	// Ensure hot-reload doesn't brick metrics
	register.clear()
}

collectDefaultMetrics({
	prefix: 'pronoundb_',
})

/// ACCOUNT METRICS
new Gauge({
	name: 'pronoundb_accounts_total',
	help: 'accounts count',
	labelNames: [],
	collect: async function () {
		const count = await countUsers()
		this.set({}, count)
	},
})

new Gauge({
	name: 'pronoundb_linked_accounts_total',
	help: 'accounts linked per platform count',
	labelNames: [ 'platform' ],
	collect: async function () {
		// - But Cynthia!!!! You're doing this every 30 seconds!!!!
		// - lol yea whatever hehe
		// - ................
		// - *noms cookie*
		const counts = await countAccountsPerPlatform()
		for (const count of counts) {
			this.set({ platform: count.platform }, count.accounts)
		}
	},
})

export const CreatedAccountCount = new Counter({
	name: 'pronoundb_account_create_count',
	help: 'amount of accounts created',
	labelNames: [ 'platform' ],
})

export const DeletedAccountCount = new Counter({
	name: 'pronoundb_account_deletion_count',
	help: 'amount of accounts deleted',
	labelNames: [],
})

export const LinkedAccountsAddCount = new Counter({
	name: 'pronoundb_linked_accounts_add_count',
	help: 'amount of accounts linked per platform',
	labelNames: [ 'platform' ],
})

export const LinkedAccountsRemovalCount = new Counter({
	name: 'pronoundb_linked_accounts_remove_count',
	help: 'amount of accounts unlinked per platform',
	labelNames: [ 'platform' ],
})

/// LOOKUP METRICS
export const LookupRequestsCounter = new Counter({
	name: 'pronoundb_lookup_requests_total',
	help: 'lookup requests count',
	labelNames: [ 'platform', 'method' ],
})

export const LookupIdsCounter = new Counter({
	name: 'pronoundb_lookup_ids_total',
	help: 'lookup requests count',
	labelNames: [ 'platform' ],
})

export const LookupBulkSizeHistogram = new Histogram({
	name: 'pronoundb_lookup_bulk_ids_count',
	help: 'amount of ids looked up per bulk request',
	labelNames: [ 'platform' ],
})

export const LookupHitCounter = new Counter({
	name: 'pronoundb_lookup_hit_total',
	help: 'successful lookup requests count',
	labelNames: [ 'platform' ],
})

/// INTERNAL HEALTH METRICS
// some more metrics might be welcome
export const ApiCallVersionCounter = new Counter({
	name: 'pronoundb_api_call_total',
	help: 'calls to the api per version',
	labelNames: [ 'version' ],
})

export const DatabaseLatencySummary = new Summary({
	name: 'pronoundb_database_latency_summary',
	help: 'summary of database latency',
	labelNames: [ 'type', 'op' ],
})

/// HELPERS
export function metrics () {
	return register.metrics()
}

// Set default values for these to make graphs behave nicely
for (const platform of providers) {
	CreatedAccountCount.inc({ platform: platform }, 0)
	LinkedAccountsAddCount.inc({ platform: platform }, 0)
	LinkedAccountsRemovalCount.inc({ platform: platform }, 0)
}

DeletedAccountCount.inc(0)

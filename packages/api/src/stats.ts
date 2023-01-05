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

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { Db } from 'mongodb'

import type { RestExtensionStats, RestStatsData } from '@pronoundb/shared'
import { Extensions } from '@pronoundb/shared/constants.js'
import { fetch } from 'undici'

const CHROME = `https://chrome.google.com/webstore/detail/${Extensions.CHROME}?hl=en`
const FIREFOX = `https://addons.mozilla.org/api/v5/addons/addon/${Extensions.FIREFOX}`
const EDGE = `https://microsoftedge.microsoft.com/addons/getproductdetailsbycrxid/${Extensions.EDGE}`

let lastFetch: number
let stats: RestStatsData = {
  users: 0,
  chrome: {
    version: '0.0.0',
    users: 0,
    rating: 0,
  },
  firefox: {
    version: '0.0.0',
    users: 0,
    rating: 0,
  },
  edge: {
    version: '0.0.0',
    users: 0,
    rating: 0,
  },
}

async function fetchChromeStats (): Promise<RestExtensionStats> {
  const data = await fetch(CHROME).then((r) => r.text())
  const version = data.match(/itemprop="version" content="([0-9.]+)/)?.[1] ?? '0.0.0'
  const install = data.match(/itemprop="interactionCount" content="UserDownloads:([0-9,]+)/)?.[1].replace(/,/g, '') ?? '0'
  const stars = Number(data.match(/class="rsw-stars".*?([0-9.]+)/)?.[1] ?? 0)

  return {
    version: version,
    users: Number(`${install[0]}${'0'.repeat(install.length - 1)}`),
    rating: Math.round(stars * 2) / 2,
  }
}

async function fetchFirefoxStats (): Promise<RestExtensionStats> {
  const data = await fetch(FIREFOX).then((r) => r.json()) as any
  const install = data.average_daily_users.toString()

  return {
    version: data.current_version.version,
    users: Number(`${install[0]}${'0'.repeat(install.length - 1)}`),
    rating: Math.round(data.ratings.average * 2) / 2,
  }
}

async function fetchEdgeStats (): Promise<RestExtensionStats> {
  const data = await fetch(EDGE).then((r) => r.json()) as any
  const install = data.activeInstallCount.toString()

  return {
    version: data.version,
    users: Number(`${install[0]}${'0'.repeat(install.length - 1)}`),
    rating: Math.round(data.averageRating * 2) / 2,
  }
}

async function fetchStats (db: Db) {
  lastFetch = Date.now() // Update last fetch immediately to prevent concurrent re-fetches
  const usersCount = await db.collection('accounts').estimatedDocumentCount()
  const [ chrome, firefox, edge ] = await Promise.all([ fetchChromeStats(), fetchFirefoxStats(), fetchEdgeStats() ])

  stats = {
    users: usersCount,
    chrome: chrome,
    firefox: firefox,
    edge: edge,
  }
}

async function getStats (this: FastifyInstance, _: FastifyRequest, reply: FastifyReply) {
  if ((Date.now() - lastFetch) > 3600e3) {
    // Initiate a re-fetch in background, but don't wait for new data
    // We can serve stale data and wait for new one to arrive
    fetchStats(this.mongo.db!)
  }

  reply.send(stats)
}

export default async function (fastify: FastifyInstance) {
  await fetchStats(fastify.mongo.db!)
  fastify.get('/', getStats)
}

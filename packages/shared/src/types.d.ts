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

declare module '@pronoundb/shared' {
  import type { ObjectId } from 'mongodb'

  export type Platform = {
    name: string
    color: string
    hasIntegration: boolean
    requiresExt?: string
    soon?: boolean
    info?: string
  }

  export type User = {
    _id: ObjectId
    pronouns: string
    accounts: ExternalAccount[]
  }

  export type MongoUser = Omit<User, '_id'>

  export type ExternalAccount = {
    id: string
    name: string
    platform: string
  }

  export type RestUser = Omit<User, '_id'> & { id: string }

  export type RestExtensionStats = {
    version: string
    users: number
    rating: number
  }

  export type RestStatsData = {
    users: number
    chrome: RestExtensionStats
    firefox: RestExtensionStats
    edge: RestExtensionStats
  }
}

declare module '@pronoundb/shared/constants.js' {
  export const WEBSITE: string

  export const Endpoints: {
    LOOKUP: (platform: string, id: string) => string
    LOOKUP_BULK: (platform: string, ids: string[]) => string
    LOOKUP_SELF: string
  }

  export const Extensions: {
    CHROME: string
    FIREFOX: string
    EDGE: string
  }
}

declare module '@pronoundb/shared/pronouns.js' {
  export const LegacyPronouns: Record<string, [ string, string ] | string>
  export const LegacyPronounsShort: typeof LegacyPronouns
}

declare module '@pronoundb/shared/platforms.js' {
  import type { Platform } from '@pronoundb/shared'

  export const Platforms: Record<string, Platform>
  export const PlatformIds: string[]
}

declare module '@pronoundb/shared/icons.js' {
  import type { JSX } from 'preact'

  export type Icon = (props: JSX.SVGAttributes) => JSX.Element

  const PlatformIcons: Record<string, Icon>
  export default PlatformIcons
}

declare module '@pronoundb/shared/format.js' {
  export function formatPronouns (id: string): string
  export function formatPronounsShort (id: string): string
  export function formatPronounsLong (id: string): string
  export function formatPronounsSuffixed (id: string): [ string, string ]
  export function usePronouns (): void
}

declare module '@pronoundb/shared/build.js' {
  type Dependency = {
    name: string | null
    homepage: string | null
    licenseText: string | null
  }

  type Plugin = {
    name: string
    generateBundle?: () => void
    closeBundle?: () => void
  }

  type License = {
    target: string
    license: string
  }

  export const baseLicensePath: string

  export function renderLicense (deps: Dependency[]): string
  export function renderLicenseWith (licenses: License[]): (deps: Dependency[]) => string
  export function finishLicense (opts: { workingDirectory: string }): Plugin
}

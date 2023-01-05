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

import { Endpoints as SharedEndpoints, Extensions } from '@pronoundb/shared/constants.js'
import useRandom from './hooks/useRandom'

export const Routes = {
  HOME: '/',

  // Account
  LOGIN: '/login',
  REGISTER: '/register',
  LINK: '/me/link',
  ME: '/me',

  // Pages
  DOCS: '/docs',
  LEGAL: '/legal',
  PRIVACY: '/privacy',

  // Marketing
  SUPPORTED: '/supported',
  SUPPORTED_PREVIEW: (platform: string) => `/supported/${platform}`,

  // Extension
  ONBOARDING: '/onboarding',
  CHANGELOGS: '/changelogs',
  CHANGELOG: (id: string) => `/changelog/${id}`,

  DONATE: 'https://ko-fi.com/cyyynthia',
  GITHUB: 'https://github.com/cyyynthia/pronoundb.org',
  GH_TRACKER: 'https://github.com/cyyynthia/pronoundb.org/issues',

  EXTENSION_CHROME: `https://chrome.google.com/webstore/detail/pronoundb/${Extensions.CHROME}`,
  EXTENSION_FIREFOX: `https://addons.mozilla.org/firefox/addon/${Extensions.FIREFOX}`,
  EXTENSION_EDGE: `https://microsoftedge.microsoft.com/addons/detail/${Extensions.EDGE}`,
}

export const Endpoints = {
  ...SharedEndpoints,
  SELF: '/api/v1/accounts/me',
  OAUTH: (platform: string, intent?: 'register' | 'login' | 'link') => `/api/v1/oauth/${platform}/authorize${intent ? `?intent=${intent}` : ''}`,
  CONNECTION: (platform: string, id: string) => `/api/v1/accounts/me/connection?platform=${platform}&id=${id}`,
}

export const Errors = {
  ERR_GENERIC: 'Something went wrong!',
  ERR_OAUTH_GENERIC: 'Could not authenticate you with the external platform due to an unknown error.',
  ERR_ALREADY_EXISTS: 'This account already exists. Did you mean to login?',
  ERR_NOT_FOUND: 'Couldn\'t find you in the database. Did you mean to create an account?',
  ERR_LOGGED_IN: 'You are already logged in.',
  ERR_NOT_LOGGED_IN: 'You must be logged in to do this.',
  ERR_ALREADY_LINKED: 'This account has already been linked to another account.',
  ERR_NO_EXT_DATA: 'Some data supposed to be provided by the extension is missing. Do you have the extension installed and up to date?',

  ERR_XLIVE_NO_ACCOUNT: 'There are no Xbox Live account associated to your Microsoft account.',
  ERR_XLIVE_CHILD: 'Your Xbox Live account cannot be processed unless it is added to a Family by an adult.',
  ERR_XLIVE_UNAVAILABLE: 'Xbox Live is unavailable in your country.',
  ERR_XLIVE_NO_MC_LICENSE: 'You do not have a Minecraft account associated with this Xbox Live account.',
}

export const Cynthia = {
  usernames: { twitch: 'cyyynthia_' },
  avatar: 'https://cdn.cynthia.dev/avatars/avatar.128.webp',
  bio: 'Meow~! Peopwal dwon\'t take mewn seriouswy \'till nyi bite n scwatch ^w^ nyen pwoceed to purr nya~', // feel the catgirl energy
  get pronouns () {
    const random = useRandom('cynthia.pronouns', 500)
    return random === 69 ? 'ii' : 'sh'
  },
}

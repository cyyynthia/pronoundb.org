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

export const Routes = Object.freeze({
  HOME: '/',
  SUPPORTED: '/supported',
  LOGIN: '/login',
  REGISTER: '/register',
  ME: '/me',
  LINK: '/link',
  DOCS: '/docs',
  LEGAL: '/legal',
  PRIVACY: '/privacy',
  GITHUB: 'https://github.com/cyyynthia/pronoundb.org',
  LINK_CHROME: 'https://chrome.google.com/webstore/detail/pronoundb/nblkbiljcjfemkfjnhoobnojjgjdmknf',
  LINK_FIREFOX: 'https://addons.mozilla.org/firefox/addon/pronoundb',
  LINK_EDGE: 'https://microsoftedge.microsoft.com/addons/detail/jbgjogfdlgjohdacngknlohahhaiaodn'
})

export const Endpoints = Object.freeze({
  SELF: '/api/v1/accounts/me',
  OAUTH: (platform: string, intent?: 'register' | 'login' | 'link') => `/api/v1/oauth/${platform}/authorize${intent ? `?intent=${intent}` : ''}`,
  CONNECTION: (platform: string, id: string) => `/api/v1/accounts/me/connection?platform=${platform}&id=${id}`
})

export const Errors: Record<string, string> = Object.freeze({
  ERR_GENERIC: 'Something went wrong!',
  ERR_OAUTH_GENERIC: 'Could not authenticate you with the external platform due to an error.',
  ERR_ALREADY_EXISTS: 'This account already exists, did you mean to login?',
  ERR_NOT_FOUND: 'No account was found, did you mean to create an account?',
  ERR_LOGGED_IN: 'You are already logged in.',
  ERR_NOT_LOGGED_IN: 'You must be logged in to do this.',
  ERR_ALREADY_LINKED: 'This account has already been linked to another account.'
})

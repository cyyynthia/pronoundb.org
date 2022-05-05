/*
 * Copyright (c) 2020-2022 Cynthia K. Rey, All rights reserved.
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

export type TestPronounsData = Record<string, string>
export type LoginProcedure = {
  loggedInOnly?: boolean // Whether unauthenticated tests should be excluded
  page: string // Login page URL
  username: string // Username input locator
  next?: string // Locator to the button to continue to the password, if required
  password: string // Password input locator
  submit: string // Login button locator
}

export const TestPronouns: Record<string, TestPronounsData> = {
  twitter: {
    // @cyyynthia_
    1300929324154060800: 'ii',
  },
  github: {
    // cyyynthia
    9999055: 'ii',
  },
  facebook: {
    // Test account associated to the PronounDB Facebook App
    100081064205146: 'sh',
  },
}

export const LoginProcedures: Record<string, LoginProcedure> = {
  twitter: {
    page: 'https://twitter.com/i/flow/login',
    username: 'input[autocomplete="username"]',
    next: 'text=Next',
    password: 'input[name="password"]',
    submit: 'text=Log in',
  },
  discord: {
    loggedInOnly: true,
    page: 'https://discord.com/login',
    username: 'input[name="email"]',
    password: 'input[name="password"]',
    submit: 'text=Login',
  },
}

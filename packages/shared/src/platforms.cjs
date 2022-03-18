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

const Platforms = {
  codeberg: {
    name: 'Codeberg',
    color: '#2185D0',
    since: '0.0.0',
    soon: true,
  },
  discord: {
    name: 'Discord',
    color: '#5865F2', // Degraded blurple, real blurple is 7289da.
    since: '0.2.0',
  },
  facebook: {
    name: 'Facebook',
    color: '#4267B2',
    since: '0.5.0',
    requiresExt: true,
  },
  github: {
    name: 'GitHub',
    color: '#211F1F',
    since: '0.2.0',
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    since: '0.0.0',
    soon: true,
  },
  mastodon: {
    name: 'Mastodon',
    color: '#3088D4',
    since: '0.0.0',
    soon: true,
  },
  osu: {
    name: 'osu!',
    color: '#FF66AA',
    since: '0.0.0',
    soon: true,
  },
  reddit: {
    name: 'Reddit',
    color: '#FF4500',
    since: '0.0.0',
    soon: true,
  },
  twitch: {
    name: 'Twitch',
    color: '#9146FF',
    since: '0.0.0',
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    since: '0.3.0',
  },
}

const PlatformIds = Object.keys(Platforms).sort()

module.exports = { Platforms: Platforms, PlatformIds: PlatformIds }

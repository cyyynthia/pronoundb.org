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

const Platforms = {
  codeberg: {
    name: 'Codeberg',
    color: '#2185D0',
    hasIntegration: true,
    soon: true,
  },
  discord: {
    name: 'Discord',
    color: '#5865F2', // Degraded blurple, real blurple is 7289da.
    hasIntegration: true,
  },
  facebook: {
    name: 'Facebook',
    color: '#4267B2',
    hasIntegration: true,
    requiresExt: '0.5.0',
  },
  github: {
    name: 'GitHub',
    color: '#211F1F',
    hasIntegration: true,
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    hasIntegration: true,
    soon: true,
  },
  mastodon: {
    name: 'Mastodon',
    color: '#3088D4',
    hasIntegration: true,
    soon: true,
  },
  minecraft: {
    name: 'Minecraft',
    color: '#854F2B',
    hasIntegration: false,
    info: 'Authentication via Xbox Live. Bedrock accounts are not supported.',
  },
  modrinth: {
    name: 'Modrinth',
    color: '#30b27b',
    hasIntegration: true,
    soon: true, // Hide it from web ui.. hacky ugh
  },
  osu: {
    name: 'osu!',
    color: '#FF66AA',
    hasIntegration: true,
    soon: true,
  },
  reddit: {
    name: 'Reddit',
    color: '#FF4500',
    hasIntegration: true,
    soon: true,
  },
  twitch: {
    name: 'Twitch',
    color: '#9146FF',
    hasIntegration: true,
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    hasIntegration: true,
  },
}

const PlatformIds = Object.keys(Platforms).sort()

module.exports = {
  Platforms: Platforms,
  PlatformIds: PlatformIds,
}

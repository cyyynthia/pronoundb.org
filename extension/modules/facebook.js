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

import { h } from '../util/dom.js'
import { executeReactProp, fetchReactProp, fetchReactPropBulk } from '../util/react.js'
import { fetchPronouns, fetchPronounsBulk } from '../util/fetch.js'
import { formatPronouns } from '../util/format.js'
import { log, warn } from '../util/log.js'
import throttle from '../util/throttle.js'
import { personCard, editThin, privacyPublic } from '../icons/facebook.js'
import { WEBSITE } from '../shared.ts'

// Facebook's way of stating someone's details is rather verbose, and never just the info as-is
function formatPronounsVerbose (pronouns, name) {
  switch (pronouns) {
    case 'any':
      return 'Goes by any pronouns'
    case 'other':
      return null // todo: find a suitable way of telling this
    case 'ask':
      return 'Prefers people to ask for their pronouns'
    case 'avoid':
      return `Wants to avoid pronouns, use ${name}'s name`
    default:
      return `Goes by "${formatPronouns(pronouns)}" pronouns`
  }
}

async function handleProfileTilesFeed (node) {
  const id = await fetchReactProp(node, [ 'child', 'child', 'memoizedProps', 'profileTileSection', '__fragmentOwner', 'variables', 'userID' ])
  const list = node.querySelector('ul')
  if (!id || !list) return

  const profile = await executeReactProp(node.parentElement, [ 'return', 'memoizedState', 'memoizedState', 'mirroredEnvironment', '$7', '$13', '$1', 'get' ], id)
  if (!profile) return

  const pronouns = await fetchPronouns('facebook', id)
  if (!pronouns) return

  list.appendChild(
    h(
      'div',
      { style: 'display: flex; margin: -6px; padding-top: 16px;' },
      h('div', { style: 'padding: 6px; width: 20px; height: 20px;' }, personCard()),
      h('div', { style: 'align-self: center; padding: 6px; color: var(--primary-text); font-size: .875rem;' }, formatPronounsVerbose(pronouns, profile.short_name))
    )
  )
}

function preprocessProfileAbout (node) {
  const overview = node.querySelector('a[href*="about_overview"]')
  if (!overview) return

  function doInject () {
    const about = document.querySelector('[data-pagelet="ProfileAppSection_0"] div + div > div > div')
    if (!about) return

    handleProfileAbout(about)
  }

  overview.addEventListener('click', () => setTimeout(() => doInject(), 50))
  doInject()
}

async function handleProfileAbout (node) {
  const id = await fetchReactProp(node, [ 'memoizedProps', 'children', 0, 'props', 'children', 'props', 'section', '__fragmentOwner', 'variables', 'userID' ])
  if (!id) return

  const profile = await executeReactProp(
    document.querySelector('[data-pagelet="ProfileAppSection_0"]'),
    [ ...Array(11).fill('return'), 'memoizedProps', 'aboutAppSectionQueryReference', 'environment', '$7', '$13', '$1', 'get' ],
    id
  )
  if (!profile) return

  const pronouns = await fetchPronouns('facebook', id)
  if (!pronouns) return

  const isSelf = Boolean(node.firstChild.firstChild.querySelector('i'))
  node.firstChild.appendChild(
    h(
      'div',
      { style: 'margin-top: 24px; display: flex; align-items: center;' },
      h('div', { style: 'padding: 6px; width: 24px; height: 24px;' }, personCard(24, 24)),
      h('div', { style: 'padding: 6px; color: var(--primary-text); font-size: .9375rem; flex: 1;' }, formatPronounsVerbose(pronouns, profile.short_name)),
      isSelf && h(
        'div',
        { style: 'display: flex;' },
        h(
          'div',
          { style: 'width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: not-allowed; filter: var(--filter-disabled-icon); margin-right: 5px;' },
          privacyPublic()
        ),
        h(
          'a',
          { href: 'https://pronoundb.org/me', target: '_blank', style: 'width: 36px; height: 36px; border-radius: 50%; background-color: var(--secondary-button-background); display: flex; align-items: center; justify-content: center;' },
          h('span', { style: 'filter: var(--filter-primary-icon); width: 20px; height: 20px;' }, editThin())
        )
      )
    )
  )
}

async function handlePopOut (popout) {
  const id = await fetchReactProp(popout, [ 'child', 'child', 'child', 'memoizedProps', 'entryPointParams', 'actorID' ])
  const list = popout.querySelector('a[role="link"]')?.parentElement?.parentElement?.lastElementChild?.firstChild?.firstChild?.lastChild?.firstChild
  if (!id || !list) return

  const profile = await executeReactProp(popout, [ 'child', 'child', 'child', 'memoizedState', 'memoizedState', 1, 0, '$7', '$13', '$1', 'get' ], id)
  if (!profile) return

  const pronouns = await fetchPronouns('facebook', id)
  if (!pronouns) return

  const filter = 'invert(41%) sepia(8%) saturate(507%) hue-rotate(179deg) brightness(93%) contrast(91%)'
  list.appendChild(
    h(
      'div',
      { style: 'display: flex; margin: -6px; padding: 8px 16px;' },
      h('div', { style: `filter: ${filter}; padding: 6px; width: 20px; height: 20px;` }, personCard()),
      h('div', { style: 'align-self: center; padding: 6px; color: var(--primary-text); font-size: .875rem;' }, formatPronounsVerbose(pronouns, profile.short_name))
    )
  )
}

async function handleArticles (articles) {
  articles = articles.filter((article) => article.isConnected)

  const targets = await fetchReactPropBulk(articles, [ 'memoizedProps', 'children', 'props', 'children', 'props', 'children', 'props', 'value', 'metaTargetProps', 'id' ])
    .then((ids) => ids.map((t) => t && document.getElementById(t)).filter(Boolean))

  if (targets.length === 0) return

  const ids = await fetchReactPropBulk(targets, [ 'memoizedProps', 'children', 0, 'props', 'story', '__fragmentOwner', 'variables', 'userID' ])
  const pronounsMap = await fetchPronounsBulk('facebook', Array.from(new Set(ids)))

  for (let i = 0; i < targets.length; i++) {
    const pronouns = pronounsMap[ids[i]]
    if (!pronouns) continue

    targets[i].appendChild(
      h('span', { style: 'font-size: .75rem; color: var(--secondary-text);', className: 'pronoundb-pronouns' }, ` · ${formatPronouns(pronouns)}`)
    )
  }
}

const handleArticle = throttle(handleArticles)

async function handleMutation (nodes) {
  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      const profileTilesFeed = added.querySelector?.('[data-pagelet="ProfileTilesFeed_0"]')
      if (profileTilesFeed) {
        handleProfileTilesFeed(profileTilesFeed)
        continue
      }

      if (added.tagName === 'DIV' && added.attributes.length === 1 && added.className && added.querySelector('image')) {
        const hoverCardProp = await fetchReactProp(added, [ 'child', 'memoizedProps', 'children', 'props', 'entryPoint', 'root' ])
        if (hoverCardProp) {
          handlePopOut(added)
          continue
        }
      }

      const articles = added.querySelectorAll?.('[role="article"]')
      if (articles && articles.length !== 0) {
        articles.forEach((article) => handleArticle(article))
        continue
      }

      if (document.querySelector('[data-pagelet="ProfileTabs"] a[href*="/about"] div div')?.className) {
        const section = document.querySelector('[data-pagelet="ProfileAppSection_0"]')
        if (added.contains(section)) {
          preprocessProfileAbout(section)
          continue
        }

        const overview = section.querySelector('a[href*="about_overview"]')
        if (added.contains(overview)) {
          console.log('AHA')
          continue
        }
      }
    }
  }
}

export function run () {
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })

  const profileTilesFeed = document.querySelector('[data-pagelet="ProfileTilesFeed_0"]')
  if (profileTilesFeed) handleProfileTilesFeed(profileTilesFeed)

  if (document.querySelector('[data-pagelet="ProfileTabs"] a[href*="/about"] div div')?.className) {
    const section = document.querySelector('[data-pagelet="ProfileAppSection_0"]')
    if (section) {
      preprocessProfileAbout(section)
    }
  }

  const articles = document.querySelectorAll('[role="article"]')
  handleArticles(Array.from(articles))
}

export const match = /^https:\/\/(.+\.)?facebook\.com/

// Scrapper to get the Real ID of people authenticating to PronounDB
export function alwaysRun () {
  if (location.pathname === '/v9.0/dialog/oauth') {
    const search = new URLSearchParams(location.search)
    if (!search.get('state') || search.get('state').includes(';;;')) return

    const redirectOrigin = new URL(search.get('redirect_uri')).origin
    if (redirectOrigin === WEBSITE) {
      log('Detected OAuth flow for PronounDB')
      const el = document.querySelector('[id^="profile_pic_header_"]')
      if (!el) {
        warn('Failed to find the Real User ID. Authentication flow will fail.')
        return
      }

      const id = el.id.slice(19)
      search.set('state', `${search.get('state')};;;${btoa(id).replace(/=/g, '')}`)
      location.search = `?${search.toString()}`
    }
  }
}

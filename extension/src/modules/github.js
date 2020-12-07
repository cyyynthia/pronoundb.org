import { commentDiscussion } from '../icons/octicons'
import { fetchPronouns, fetchPronounsBulk } from '../fetch'
import { css, h } from '../util'

function injectHoverCards () {
  const popover = document.querySelector('.js-hovercard-content > .Popover-message')
  const observer = new MutationObserver(
    async function () {
      const tracking = popover.querySelector('[data-hovercard-tracking]')?.dataset?.hovercardTracking
      const hv = popover.querySelector('[data-hydro-view]')?.dataset?.hydroView
      if (!tracking || !hv) return

      const { user_id: userId } = JSON.parse(tracking)
      const { event_type: type } = JSON.parse(hv)
      if (type !== 'user-hovercard-hover') return

      const block = popover.querySelector('.d-flex .overflow-hidden.ml-3')
      if (!block) return

      const pronouns = await fetchPronouns('github', String(userId))
      if (!pronouns) return

      const item = block.querySelector('.mt-2')
      if (item) item.remove()
      block.appendChild(
        h(
          'div',
          { style: css({ display: 'flex', alignItems: 'center' }) },
          item,
          h(
            'div',
            {
              class: 'mt-2 text-gray text-small',
              style: css({ marginTop: '8px !important', marginLeft: item ? '8px' : '0' })
            },
            commentDiscussion({ class: 'octicon' }),
            '\n  ',
            pronouns
          )
        )
      )
    }
  )

  observer.observe(popover, { childList: true })
}

async function injectUserProfile () {
  const userId = document.querySelector('[data-scope-id]').dataset.scopeId
  const list = document.querySelector('.vcard-details')
  if (!userId || !list) return

  const pronouns = await fetchPronouns('github', userId)
  if (!pronouns) return

  list.appendChild(
    h(
      'li',
      {
        class: 'vcard-detail pt-1 css-truncate css-truncate-target hide-sm hide-md',
        itemprop: 'pronouns',
        show_title: false,
        'aria-label': `Pronouns: ${pronouns}`
      },
      commentDiscussion({ class: 'octicon' }),
      h('span', { class: 'p-label' }, pronouns)
    )
  )
}

async function injectProfileLists () {
  const items = Array.from(document.querySelectorAll('.user-profile-nav + div .d-table'))
  const ids = items.map(item => {
    const id = item.querySelector('img').src.match(/\/u\/(\d+)/)[1]
    item.dataset.userId = id
    return id
  })

  const pronouns = await fetchPronounsBulk('github', ids)
  for (const item of items) {
    if (pronouns[item.dataset.userId]) {
      const col = item.querySelector('.d-table-cell + .d-table-cell')
      let about = col.querySelector('.mb-0')
      const margin = Boolean(about)
      if (!about) {
        about = h('p', { class: 'text-gray text-small mb-0' })
        col.appendChild(about)
      }

      about.appendChild(
        h(
          'span',
          { class: margin ? 'ml-3' : '' },
          commentDiscussion({ class: 'octicon' }),
          '\n  ',
          pronouns[item.dataset.userId]
        )
      )
    }
  }
}

function inject () {
  injectHoverCards()
  if (document.querySelector('.user-profile-nav')) {
    injectUserProfile()

    const tab = new URLSearchParams(location.search).get('tab')
    if (tab === 'followers' || tab === 'following') {
      injectProfileLists()
    }
  }

  document.head.appendChild(
    h('style', null, '.js-hovercard-content .d-flex .overflow-hidden.ml-3 .mt-2 + .mt-2 { margin-top: 4px !important; }')
  )
}

if (/(^|\.)github\.com$/.test(location.hostname)) {
  inject()
}

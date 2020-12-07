import { fetchPronouns } from '../fetch'
import { topics } from '../icons/twitter'
import { h, css } from '../util'

async function injectProfileHeader (header) {
  console.dir(header)
  const pronouns = await fetchPronouns('twitter', null)
  if (pronouns) {
    const template = header.children[header.children.length - 1]
    header.appendChild(
      h(
        'span',
        { class: template.className, 'data-pronoundb': 'true' },
        topics({ class: template.children[0].getAttribute('class') }),
        pronouns
      )
    )
  }
}

async function injectProfilePopout (popout) {
  const reactKey = Object.keys(popout).find(k => k.startsWith('__reactInternalInstance'))
  const pronouns = await fetchPronouns('twitter', popout[reactKey].memoizedProps.children[3].props.children.props.userId)
  if (pronouns) {
    if (popout.querySelector('[data-pronoundb]')) return
    const template = popout.querySelector('div + div [dir=ltr]')
    const childClass = template.children[0].className
    const parentClass = template.className
    const element = h(
      'span',
      { class: parentClass, 'data-pronoundb': 'true' },
      h(
        'span',
        {
          class: childClass,
          style: css({
            display: 'flex',
            alignItems: 'center',
            marginRight: '4px'
          })
        },
        topics({
          style: css({
            color: 'inherit',
            fill: 'currentColor',
            width: '1.1em',
            height: '1.1em',
            marginRight: '4px'
          })
        }),
        pronouns
      )
    )
    popout.insertBefore(element, popout.children[2])
  }
}

function handleMutation (nodes) {
  const layers = document.querySelector('#layers')
  if (!layers) return

  for (const { addedNodes } of nodes) {
    for (const added of addedNodes) {
      if (layers.contains(added)) {
        const link = added.querySelector('a[href*="/following"]')
        if (link) {
          injectProfilePopout(link.parentElement.parentElement.parentElement.parentElement)
        }
      } else {
        const header = added.querySelector?.('[data-testid="UserProfileHeader_Items"]')
        if (header) {
          injectProfileHeader(header)
        }
      }
    }
  }
}

function inject () {
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

if (/(^|\.)twitter\.com$/.test(location.hostname)) {
  inject()
}

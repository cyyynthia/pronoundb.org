import { fetchPronouns } from '../fetch'
import { h, css } from '../util'

function makeChatBadge (pronouns) {
  const style = css({
    display: 'inline-block',
    borderRadius: 'var(--border-radius-medium)',
    backgroundColor: 'var(--color-background-button-secondary-default)',
    color: 'var(--color-text-button-secondary)',
    lineHeight: '1.8rem',
    position: 'relative',
    bottom: '-1px',
    marginRight: '4px',
    padding: '0 2px'
  })

  return h('span', { style }, pronouns)
}

async function injectChatLine (line) {
  const reactKey = Object.keys(line).find(k => k.startsWith('__reactInternalInstance'))
  const pronouns = await fetchPronouns('twitch', line[reactKey].return.memoizedProps.message.user.userID)
  if (pronouns) {
    const username = line.querySelector('.chat-line__username-container')
    username.parentNode.insertBefore(makeChatBadge(pronouns), username)
  }
}

function handleMutation (nodes) {
  for (const { target, addedNodes } of nodes) {
    if (target.classList?.contains('chat-scrollable-area__message-container')) {
      for (const added of addedNodes) {
        if (added.classList?.contains('chat-line__message')) {
          injectChatLine(added)
        }
      }
    }
  }
}

function inject () {
  // todo: consider injecting in the React component for chat lines rather than relying on a MO
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })
}

if (/(^|\.)twitch\.tv$/.test(location.hostname)) {
  inject()
}

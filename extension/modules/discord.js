import { h, css } from '../util/dom'
import { connect, invoke } from '../util/bridge'
import { fetchPronouns, fetchPronounsBulk } from '../util/fetch'

// Author ID fetchers
function fetchMessageAuthors (ids) {
  const idMap = {}

  // Use old for to avoid transpilation
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i]
    const node = document.getElementById(`chat-messages-${id}`)
    if (!node) continue // happens when message just gets sent

    // seems like discord somehow makes reactInternalInstance static w/o the random part
    idMap[id] = node.__reactInternalInstance$.memoizedProps.children[2].props.message.author.id
  }

  return idMap
}

function fetchPoppedUser (id) {
  return document.getElementById(id)
    .__reactInternalInstance$.memoizedProps
    .children.props.children.props.children.props.userId
}

function fetchFocusedUser () {  
  return document.querySelector('div[class^="modal-"]')
    .__reactInternalInstance$.memoizedProps
    .children.props.children.props.user.id
}

// Handlers
async function handleMessages (nodes) {
  const ids = nodes.map(node => node.id.slice(14))
  const idMap = await invoke(fetchMessageAuthors, ids)
  const authors = Array.from(new Set(Object.values(idMap)))
  const pronounsMap = await fetchPronounsBulk('discord', authors)

  for (const id of ids) {
    const pronouns = pronounsMap[idMap[id]]
    const header = document.querySelector(`#chat-messages-${id} h2`)
    if (pronouns && header) {
      header.appendChild(
        h('span', { class: 'pronoundb-pronouns', style: css({ color: 'var(--text-muted)', fontSize: '.9rem' }) }, ` • ${pronouns}`)
      )
    }
  }
}

async function handleUserPopOut (node) {
  const id = await invoke(fetchPoppedUser, node.id)
  const pronouns = await fetchPronouns('discord', id)

  if (pronouns) {
    const frag = document.createDocumentFragment()
    frag.appendChild(h('div', { class: 'bodyTitle-Y0qMQz marginBottom8-AtZOdT size12-3R0845' }, 'Pronouns'))
    frag.appendChild(h('div', { class: 'marginBottom8-AtZOdT size14-e6ZScH' }, pronouns))
    node.querySelector('.bodyInnerWrapper-Z8WDxe').appendChild(frag)

    setTimeout(() => {
      const { y, height } = node.getBoundingClientRect()
      const bottom = window.innerHeight - y - height - 16
      if (bottom < 0) node.style.top = `${parseInt(node.style.top) + bottom}px`
    }, 0)
  }
}

async function handleUserModal (node) {
  const id = await invoke(fetchFocusedUser)
  const pronouns = await fetchPronouns('discord', id)

  if (pronouns) {
    const container = node.querySelector('.userInfoSection-2acyCx')
    container.classList.add('has-pronouns')

    const frag = document.createDocumentFragment()
    frag.appendChild(h('div', { class: 'userInfoSectionHeader-CBvMDh' }, 'Pronouns'))
    frag.appendChild(h('div', { class: 'marginBottom8-AtZOdT size14-e6ZScH colorStandard-2KCXvj' }, pronouns))
    container.appendChild(frag)
  }
}

// Throttle messages to bulk process them
let messageTimer = null
let messagesBuffer = []
function handleMessage (node) {
  if (messageTimer) clearTimeout(messageTimer)
  messageTimer = setTimeout(() => {
    handleMessages(messagesBuffer)
    messageTimer = null
    messagesBuffer = []
  }, 200)

  messagesBuffer.push(node)
}

function handleMutation (mutations) {
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (node.id?.startsWith('chat-messages-')) {
        handleMessage(node)
        continue
      }
      
      if (node.id?.startsWith?.('popout_') && node.querySelector('div[role="dialog"][class^="userPopout-"]')) {
        handleUserPopOut(node)
        continue
      }

      if (node.className?.startsWith?.('modal-') && node.querySelector('div[class^="userInfoSection-"')) {
        handleUserModal(node)
        continue
      }
    }
  }
}

export function run () {
  connect()
  const observer = new MutationObserver(handleMutation)
  observer.observe(document, { childList: true, subtree: true })

  const style = document.createElement('style')
  style.textContent = `
    .headerText-3Uvj1Y + .pronoundb-pronouns { margin-right: .6rem; }
    .userInfoSection-2acyCx.has-pronouns { display: grid; grid-template-columns: 3fr 1fr; grid-column-gap: 16px; }
    .userInfoSection-2acyCx.has-pronouns .userInfoSectionHeader-CBvMDh { grid-row: 1; }
  `
  document.head.appendChild(style)
}

export const match = /^https:\/\/(.+\.)?discord\.com\/(channels|activity|login|app|library|store)/

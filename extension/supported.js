const params = new URLSearchParams(location.search)
document.querySelectorAll('[data-platform]').forEach((el) => {
  el.innerText = params.get('platform')
})

document.querySelectorAll('[data-close]').forEach((el) => {
  el.addEventListener('click', () => parent.postMessage({ msg: 'pronoundb::supported::close' }, '*'))
})

document.querySelectorAll('[data-close-forever]').forEach((el) => {
  el.addEventListener('click', () => {
    chrome.storage.sync.set({ noPopup: true })
    parent.postMessage({ msg: 'pronoundb::supported::close' }, '*')
  })
})

function emitHeight () {
  parent.postMessage({ msg: 'pronoundb::supported::height', height: document.body.scrollHeight }, '*')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => emitHeight())
} else {
  emitHeight()
}

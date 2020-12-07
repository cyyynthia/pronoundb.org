export function h (tag, props, ...child) {
  const e = document.createElement(tag)
  if (props) {
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        e.setAttribute(key, String(props[key]))
      }
    }
  }

  for (const c of child) {
    if (!c) continue
    e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)
  }

  return e
}

export function css (style) {
  let res = ''
  for (const prop in style) {
    if (Object.prototype.hasOwnProperty.call(style, prop)) {
      res += `${prop.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`)}:${style[prop]};`
    }
  }
  return res
}

export function sleep (ms) {
  return new Promise(res => setTimeout(res, ms))
}

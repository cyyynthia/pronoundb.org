const { join } = require('path')
const { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync } = require('fs')
const manifest = require('./manifest.browser.json')
const { version } = require('../package.json')

function mkdirOverwrite (path) {
  if (existsSync(path)) {
    for (const file of readdirSync(path)) {
      const full = join(path, file)
      if (statSync(full).isDirectory()) {
        rmdirRf(full)
      } else {
        unlinkSync(full)
      }
    }
  } else {
    mkdirSync(path)
  }
}

// Load files in memory
const backgroundScriptFile = join(__dirname, '..', 'dist', 'extension', 'background.js')
const contentScriptFile = join(__dirname, '..', 'dist', 'extension', 'pronoundb.js')
const popupScriptFile = join(__dirname, '..', 'dist', 'extension', 'popup.js')
const popupStyleFile = join(__dirname, '..', 'extension', 'popup.css')
const popupHtmlFile = join(__dirname, '..', 'extension', 'popup.html')

const backgroundScript = readFileSync(join(backgroundScriptFile), 'utf8')
const contentScript = readFileSync(join(contentScriptFile), 'utf8')
const popupScript = readFileSync(join(popupScriptFile), 'utf8')
const popupStyle = readFileSync(join(popupStyleFile), 'utf8')
const popupHtml = readFileSync(join(popupHtmlFile), 'utf8')

manifest.version = version
if (process.argv.includes('--pack')) {
  // Load source maps
  const backgroundScriptMapFile = join(__dirname, '..', 'dist', 'extension', 'background.js.map')
  const contentScriptMapFile = join(__dirname, '..', 'dist', 'extension', 'pronoundb.js.map')
  const popupScriptMapFile = join(__dirname, '..', 'dist', 'extension', 'popup.js.map')

  const backgroundScriptMap = readFileSync(join(backgroundScriptMapFile), 'utf8')
  const contentScriptMap = readFileSync(join(contentScriptMapFile), 'utf8')
  const popupScriptMap = readFileSync(join(popupScriptMapFile), 'utf8')

  // Create zip
  console.log('not implemented')
} else {
  manifest.permissions.push('http://localhost:8080/api/v1/*')
  const dest = join(__dirname, '..', 'dist', 'extension', 'unpacked')
  mkdirOverwrite(dest)

  writeFileSync(join(dest, 'background.js'), backgroundScript)
  writeFileSync(join(dest, 'script.js'), contentScript)
  writeFileSync(join(dest, 'popup.js'), popupScript)
  writeFileSync(join(dest, 'popup.css'), popupStyle)
  writeFileSync(join(dest, 'popup.html'), popupHtml)
  writeFileSync(join(dest, 'manifest.json'), JSON.stringify(manifest, null, 2))
}

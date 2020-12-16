const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const manifest = require('./manifest.powercord.json')
const { version } = require('../package.json')

manifest.version = `${version}-powercord`
const manifestPath = join(__dirname, '..', 'dist', 'plugins', 'powercord', 'manifest.json')
const pluginPath = join(__dirname, '..', 'dist', 'plugins', 'powercord', 'index.js')

const plugin = readFileSync(pluginPath, 'utf8')
writeFileSync(pluginPath, plugin.replace(/0\.0\.0-unknown/g, `${version}-powercord`))
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

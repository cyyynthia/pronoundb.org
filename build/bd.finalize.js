const { join } = require('path')
const { readFileSync, writeFileSync } = require('fs')
const { version } = require('../package.json')

const templatePath = join(__dirname, 'bd.template.js')
const pluginPath = join(__dirname, '..', 'dist', 'bd', 'PronounDB.plugin.js')

const template = readFileSync(templatePath, 'utf8')
const plugin = readFileSync(pluginPath, 'utf8')
const full = template.replace('// {{ code }}', plugin).replace(/0\.0\.0-unknown/g, `${version}-bd`)
writeFileSync(pluginPath, full)

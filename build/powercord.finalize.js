const { join } = require('path')
const { writeFileSync } = require('fs')
const manifest = require('./manifest.powercord.json')
const { version } = require('../package.json')

manifest.version = `${version}-powercord`
const manifestPath = join(__dirname, '..', 'dist', 'powercord', 'manifest.json')
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

# PronounDB
[![License](https://img.shields.io/github/license/cyyynthia/pronoundb.svg?style=flat-square)](https://github.com/cyyynthia/pronoundb/blob/mistress/LICENSE)

A Chrome/Firefox extention that lets people know how to refer to each other on various places of the Internet, so
mistakes are less likely to happen. Link your accounts, set your pronouns and magically fellow PronounDB users will
know your pronouns. Simple, efficient. Check it out at https://pronoundb.org!

The extension aims to inject that piece of information in a discrete way, that matches with the website you're looking
at and finds a balance between ease to find and doing too much.

## Supported services
 - GitHub
 - Discord (Web)
   - Exists as a [plugin](https://github.com/cyyynthia/pronoundb-powercord) for [Powercord](https://powercord.dev)
 - Twitter
 - Twitch

**Support coming soon:tm: for:**
 - Reddit
 - Mastodon
 - GitLab

Want to see another service supported? Shoot an issue!

## Structure
 - The backend is built using [fastify](https://fastify.io)
 - The frontend is built using [preact](https://preactjs.com) and bundled with [webpack](https://webpack.js.org)
 - The extension is bundled using [microbundle](https://github.com/developit/microbundle)
 - Data is stored using [mongodb](https://mongodb.com)
 - May contains stains of coffee and a few cookie crumbs :whistle:

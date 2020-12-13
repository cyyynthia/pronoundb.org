# PronounDB
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G71TSDF)<br>
[![License](https://img.shields.io/github/license/cyyynthia/pronoundb.org.svg?style=flat-square)](https://github.com/cyyynthia/pronoundb.org/blob/mistress/LICENSE)

A Chrome/Firefox extension that lets people know how to refer to each other on various places of the Internet, so
mistakes are less likely to happen. Link your accounts, set your pronouns and magically fellow PronounDB users will
know your pronouns. Simple, efficient. Check it out at https://pronoundb.org!

The extension aims to inject that piece of information in a discrete way, that matches with the website you're looking
at and finds a balance between ease to find and doing too much.

## Supported services
 - GitHub
 - Discord (Web)
   - Exists as a [plugin](https://github.com/cyyynthia/pronoundb-powercord) for [Powercord](https://powercord.dev)
   - Exists as a [plugin](https://cdn.cynthia.dev/pronoundb/PronounDB.plugin.js) for [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp)
 - Twitch

**Support coming soon:tm: for:**
 - Twitter
 - Mastodon
 - GitLab
 - Reddit

Want to see another service supported? Shoot an issue!

## Structure
 - The backend is built using [fastify](https://fastify.io)
 - The frontend is built using [preact](https://preactjs.com) and bundled with [webpack](https://webpack.js.org)
 - The extension is bundled using [microbundle](https://github.com/developit/microbundle)
 - Data is stored using [mongodb](https://mongodb.com)
 - May contains stains of coffee and a few cookie crumbs :whistle:

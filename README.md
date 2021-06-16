# PronounDB
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G71TSDF)<br>
[![License](https://img.shields.io/github/license/cyyynthia/pronoundb.org.svg?style=flat-square)](https://github.com/cyyynthia/pronoundb.org/blob/mistress/LICENSE)

A browser extension that lets people know how to refer to each other on various places of the Internet, so mistakes are
less likely to happen. Link your accounts, set your pronouns and magically fellow PronounDB users will know your
pronouns. Simple, efficient. Check it out at https://pronoundb.org!

The extension aims to inject that piece of information in a discrete way, that matches with the website you're looking
at and finds a balance between ease to find and doing too much.

## Get the extension
 - [Chrome Web Store](https://chrome.google.com/webstore/detail/pronoundb/nblkbiljcjfemkfjnhoobnojjgjdmknf)
 - [Mozilla Add-ons](https://addons.mozilla.org/firefox/addon/pronoundb)
 (Android support coming soon, see [this issue](https://github.com/cyyynthia/pronoundb.org/issues/10))
 - [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/jbgjogfdlgjohdacngknlohahhaiaodn)

## Supported services
 - Discord
 - Facebook
 - GitHub
 - Twitch
 - Twitter

Want to see another service supported? Shoot an issue!

## Other resources
 - [Powercord](https://powercord.dev) plugin: https://github.com/cyyynthia/pronoundb-powercord
 - [BetterDiscord](http://betterdiscord.app) plugin by [@Strencher](https://github.com/Strencher): https://betterdiscord.app/plugin/PronounDB
 - [Aliucord](https://github.com/Aliucord/Aliucord) plugin by [@Juby210](https://github.com/Juby210): https://github.com/Juby210/Aliucord-plugins#pronoundb
 - Discord bot by [@NurMarvin](https://github.com/NurMarvin): https://github.com/NurMarvin/pronoundb-bot ([Invite](https://nurmarv.in/invite-pronoundb-bot))

## Structure
 - The backend is built using [fastify](https://fastify.io)
 - The frontend is built using [preact](https://preactjs.com), [tailwindcss](https://tailwindcss.com) and [vite](https://vitejs.dev)
 - The extension is bundled using [microbundle](https://github.com/developit/microbundle)
 - Data is stored using [mongodb](https://mongodb.com)
 - May contains stains of coffee and a few cookie crumbs :whistle:

## FAQ
### Neo-pronouns and/or custom pronouns support?
Based on the current architecture, and the features I want to implement, neo-pronouns support is not something I'll
be adding. The list of sets would grow exponentially and would become unmaintainable, or I'd need to add custom
pronouns and moderate the platform usage (for offensive stuff) and this is a strict no from me.

I want to add internationalization support in the future, and neo-pronouns are very much english-only and make for
not very amazing i18n. Just with the current sets it's a problem for some languages! Sure I can skip them, but it's
not a path I want to take.

PronounDB is a side project I don't want to put tons of time in it, and that's sadly incompatible with adding support
of neo-pronouns. Some people will say there are sets that are less used than some neo-pronouns. Maybe, maybe not. I
just made all combinations possible.

Some suggested supporting "popular" neo-pronouns, which is something I don't feel confident with either.

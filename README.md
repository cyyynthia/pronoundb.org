# PronounDB
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G71TSDF)

[![License](https://img.shields.io/github/license/cyyynthia/pronoundb.org.svg?style=flat-square)](https://github.com/cyyynthia/pronoundb.org/blob/mistress/LICENSE)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/nblkbiljcjfemkfjnhoobnojjgjdmknf?logo=google-chrome&logoColor=white&style=flat-square)](https://chrome.google.com/webstore/detail/pronoundb/nblkbiljcjfemkfjnhoobnojjgjdmknf)
[![Mozilla Add-on](https://img.shields.io/amo/v/pronoundb?logo=firefox&logoColor=white&style=flat-square)](https://addons.mozilla.org/firefox/addon/pronoundb)
[![Edge Add-on](https://img.shields.io/badge/dynamic/json?label=edge%20add-on&prefix=v&color=fe7d37&logo=microsoftedge&logoColor=white&style=flat-square&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fjbgjogfdlgjohdacngknlohahhaiaodn)](https://microsoftedge.microsoft.com/addons/detail/jbgjogfdlgjohdacngknlohahhaiaodn)

Get people's pronouns right, all the time, without struggling

PronounDB is a browser extension that makes it easy for everyone to know and share pronouns. Link your accounts, set
your pronouns and just like magic all fellow PronounDB users know your pronouns. Simple, efficient. Check it out at
https://pronoundb.org!

You can find a list of supported platforms, and a quick preview of how the extension looks at
https://pronoundb.org/supported.

## Get the extension
 - [Chrome Web Store](https://chrome.google.com/webstore/detail/pronoundb/nblkbiljcjfemkfjnhoobnojjgjdmknf)
 - [Mozilla Add-ons](https://addons.mozilla.org/firefox/addon/pronoundb)
 (Android support coming soon, see [this issue](https://github.com/cyyynthia/pronoundb.org/issues/10))
 - [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/jbgjogfdlgjohdacngknlohahhaiaodn)

## Other resources
These resources are non-official and are **not** endorsed by pronoundb.org. Please reach out to the respective owners
for help or support regarding these.

**Warning**: These Discord plugins are in direct violation of Discord's Terms of Service. Use them at your own risk.
 - [Powercord](https://powercord.dev) plugin: https://github.com/cyyynthia/pronoundb-powercord
 - [BetterDiscord](http://betterdiscord.app) plugin by [@Strencher](https://github.com/Strencher): https://betterdiscord.app/plugin/PronounDB
 - [Aliucord](https://github.com/Aliucord/Aliucord) plugin by [@Juby210](https://github.com/Juby210): https://github.com/Juby210/Aliucord-plugins#pronoundb

### Dead/unmaintained
These projects are either dead or unmaintained for the time being.

 - Discord bot by [@NurMarvin](https://github.com/NurMarvin): https://github.com/NurMarvin/pronoundb-bot ([Invite](https://nurmarv.in/invite-pronoundb-bot))

## Structure
 - The backend is built using [fastify](https://fastify.io)
 - The frontend and the extension are built using [preact](https://preactjs.com), [tailwindcss](https://tailwindcss.com), and [vite](https://vitejs.dev)
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

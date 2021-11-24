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
### Neo-pronouns support
For the time being, neo-pronouns are not supported by PronounDB. However, they might get added in the future.

In my [original statement](https://github.com/cyyynthia/pronoundb.org/blob/f8eaea19/README.md#faq), I stated that
they would not be something I'll be adding - this is (probably) no longer the case.

I'll be changing the way pronouns are internally handled and formatted soon, which should allow for this to happen.
I also revised some of my plans regarding internationalization and found some compromises there too.

### Custom pronouns
There won't be a way to use pronouns that aren't available in PronounDB. The only way would be to have a free text
input for people to type their pronouns in, which would require me to start moderating the platform for abusive
content which is a strict no from me.

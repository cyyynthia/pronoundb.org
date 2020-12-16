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
   - Exists as a [plugin](https://cdn.cynthia.dev/pronoundb/PronounDB.plugin.js) for [BetterDiscord](https://github.com/rauenzi/BetterDiscordApp) (**Experimental, and most likely broken to some extent. Lacks self-updating and some functionalities**).
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

## FAQ
### Neopronouns support
TL;DR: Too much things to consider, and there are too many neopronouns to have proper support.

[Original issue](https://github.com/cyyynthia/pronoundb.org/issues/3)

Support for neopronouns was suggested, but after discussing the conclusion was that supporting them would bring more
downsides than it'd solve problems. One of the major issue is the amount of neopronouns out there, which makes building
a complete list near impossible, and the pronoun selector would be gigantic and need UX tweaks.

A proposal was to only support the most common/popular ones, but the issue with that is that defining how common/popular
a neopronoun is is complicated, and could be seen as unfair. I also considered unfair to only support a few neopronouns,
and tell people going by unlisted ones "sorry, your pronouns aren't popular enough". This sounds super harsh and
definitely not something people may want to be confronted with.

Another proposal was to let people input a custom set of pronouns themselves, but I rejected this as it'd make it way
too easy for people with evil intents to abuse the platform and mock communities or individuals. Moderating the
platform could be a possibility, but I don't want to get a team of moderators and start watching everything, which
would get exponentially more and more time consuming.

As a final decision, it was considered acceptable to let people use "Other" when going by neopronouns, and have an
additional option which explicitly tells people they can feel free to ask the person about their pronouns. This
decision may, in the future, be revised if there's popular demand or if I randomly decide to.

Hello reviewer 👋

### Requirements
NodeJS and pnpm (https://pnpm.js.org) are required to bundle the extension.

### Bundling the extension
The bundle process is as easy as installing dependencies (`pnpm i`) and then running the build script
(`pnpm run ext:build`). The archive will be located in `dist/extension/packed/pronoundb.firefox.zip`.

Note: Since the package.json is shared for the entire project, unnecessary dependencies (such as preact, fastify,
webpack...) will get installed. I didn't want to filter them to leave the build environment as similar as it is on my
end. Those dependencies are used for the backend and the frontend of the pronoundb.org website.

### Testing the extension
The easiest way to test the extension is to give a look to GitHub profiles, since it doesn't require owning an account
on the platform and doesn't require interaction from another user.

On my GitHub profile at https://github.com/cyyynthia, you will see, under the user information (email, location, org)
an additional field which will show pronouns. You can also see it appear on hovercards, which you can get by going on
https://github.com/cyyynthia/pronoundb.org and hovering my username. Pronouns will show up next to the location field.

### Have a cookie?
🍪

# Hacking
This document serves as a description of how PronounDB works internally, to help contributors who wish to add new
platforms, fix bugs, or dig into the source code in general.

## General structure
PronounDB is entirely written in TypeScript, with a small limited amount of JavaScript for shared components (to
avoid annoying compilation overhead when the benefits are small enough).

The repository is a monorepo which contains 4 different packages (+ various configuration files):
  - `packages/extension`: Browser extension
  - `packages/website`: Frontend source code
  - `packages/api`: REST API source code
  - `packages/shared`: Shared internal library, for data/config/... shared between different modules

This repo uses [pnpm](https://pnpm.io/) for dependency management and general management. You will most likely run into
troubles if you try to use another package manager.

### Development environment
You can quickly spin up a development environment with [docker compose](https://docs.docker.com/compose/), which will
have everything needed for PronounDB's website & API to work. It'll have hot-reloading on both the website and the API.

To test the extension, you can run `pnpm run dev` in the extension package to build the extension & enable automatic
re-building when files are changed. You'll need to load the extension in your browser manually, and to refresh it
manually every time in the browser.

**Note**: You can only test (easily) in Chromium-based browsers at the time.

### Building for production
The website, API and extension can all be built using `pnpm run build`.

The extension can additionally be packed for submission on extension stores using `pnpm run pack`, which will produce:
  - An archive for Chromium-based browsers
  - An archive for Firefox-based browsers
  - An archive of the source code with notes for reviewers (used to submit to the Mozilla Add-Ons team)

### Testing & linting
Code styling is enforced using [ESLint](https://eslint.org/), and you can run the linter using `pnpm run lint`.

The extension can be tested end-to-end using [Playwright](https://playwright.dev/) by using `pnpm run test` in the
extension package. E2E tests do not require the API to be running; test data is provided via API mocks. **You need
to build the extension with `pnpm run build` before running the tests**.

See the [test accounts](#test-accounts) section for more details about how to E2E test an app with a test account.

## Building a new integration
### Addition to the shared library
The first step is to add the platform to the list of supported platforms, by adding:
  - An entry in `packages/shared/src/platforms.cjs`
  - Associate an icon in `packages/shared/src/icons.js`

### Setup the OAuth flow
This step is very simple and requires very little amount of work, thanks to OAuth being a well-implemented standard.
You simply need to:
  - Add the key-pair entry in `config.example.json`
  - Create a new file for your platform in `packages/api/src/oauth` (You can copy an existing one, like the `discord.ts` file)
  - Modify the oauth endpoints, scopes, and the config appropriately
  - Implement the `getSelf` function, which should return an object of type `ExternalAccount` (or `null` if an error occurred)
  - Register your module in `packages/api/src/oauth/index.ts`

And voilà! The OAuth flow should be working like a charm.

**Note**: If you need to follow an older OAuth 1.0a authentication standard, take a look at how `twitter.ts` handles it.

### Build the extension integration
This is by far the most time-consuming part of making a new integration. To get started, you need to create a new file
in `packages/extension/src/modules`, which needs to export 2 things:

 - `match`: a RegExp which will be tested against pages paths to know when a module should run.
 - `inject`: the entry point of your module.

You can look at how other modules are built to get some insight in how things should be done, and how they're done.

#### Utility methods
*TODO*: Document React prop fetcher, DOM helpers (`h`, `css`)

#### Settings
*TBD*

### Test the integration
**Note**: Extension E2E tests are very WIP, and not fully finished yet. The goal is to have all modules tested and run
tests periodically using GitHub Actions. Right now, GitHub Actions aren't configured.

To ensure continuous testing and detection when a website update breaks one of the modules, it's best to test the
extension. Tests are ran using [Playwright](https://playwright.dev/) and you can take a look at how other modules
are tested to get some inspiration.

#### Test accounts
*TBD* [#59](https://github.com/cyyynthia/pronoundb.org/issues/59)

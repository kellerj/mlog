# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

mlog (Markdown Log) is a Node.js CLI tool and web server for managing markdown-based daily logs. Entries are stored by category and date on the filesystem, with auto-generated index files and a browser-based viewer.

## Common Commands

```bash
npm install                # Install dependencies
npm link                   # Install mlog globally on your path

npm run lint               # ESLint (airbnb-base) on src/
npm test                   # Tests with coverage (NYC + Mocha)
npm run test:mocha         # Tests without coverage
npm run test:watch         # Mocha in watch mode

# Run a single test file:
npx mocha --require babel-register --reporter spec test/lib/main.test.js

npm run mlog               # Run CLI via babel-register
npm run mlog-debug         # Run CLI with DEBUG=mlog:* logging
npm run server             # Start Express dev server (nodemon + debug)

npm run prepare            # Babel compile src/ -> dist/
npm run watch              # Babel watch mode
```

## Architecture

**Source is ES6** transpiled by Babel (`babel-preset-env` targeting current Node). Source lives in `src/`, compiled output in `dist/`.

### Source Layout (`src/`)

- **`commands/`** - CLI entry points using Commander.js. Each command is a separate file (`mlog.js` is the main router; `mlog-add.js`, `mlog-init.js`, `mlog-config.js`, `mlog-open.js`, `mlog-server.js`).
- **`lib/`** - Core logic. `main.js` handles entry creation and index management. `config.js` handles configuration loading/saving. `default-config.js` is the config template.
- **`server/`** - Express web server with a custom markdown view engine (marked.js), Bootstrap UI, and EJS templates.

### Two-Tier Configuration

1. **Home config** (`~/.mlog-config.json`) - points to the logbook directory
2. **Logbook config** (`logbook-config.json` in logbook dir) - categories, date format, server port, title

### Logbook Filesystem Structure

```
logbook/
├── logbook-config.json
├── index.md
└── Category_Name/          # spaces become underscores
    ├── index.md
    └── YYYY-MM-DD.md       # configurable date format
```

### Testing

- Mocha + Chai (expect style) + Sinon for mocks
- Tests in `test/` mirror `src/lib/` structure
- NYC coverage targets: 90% lines/statements, 100% functions, 75% branches
- `src/commands/` excluded from coverage

### Code Style

- ESLint with `airbnb-base` extended config
- Console output allowed (`no-console: off`)
- Max line length 100 chars (warn only, strings/URLs/comments exempt)
- Debug logging via `debug` module with `mlog:*` namespace
- Colored terminal output via `chalk`

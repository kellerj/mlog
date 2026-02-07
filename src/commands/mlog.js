#!/usr/bin/env node

import { createRequire } from 'node:module';
import debug from 'debug';
import { Command } from 'commander';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

const LOG = debug('mlog');

// Set logbook files to be only accessible by the current user
process.umask(0o077);

const program = new Command();

program
  .version(pkg.version)
  .usage('<command> [options]')
  .command('init <directory>', 'Initialize a new repository at the given location.')
  .command('config [command] [options]', 'Set configuration options for the current logbook.')
  .command('add [options]', 'Add an entry to the logbook', { isDefault: true })
  .command('open', 'Open the logbook directory in the file system browser.')
  .command('server [options]', 'Startup a web server to display the rendered markdown log entries.');

program.parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(program);

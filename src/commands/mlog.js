#!/usr/bin/env node

import debug from 'debug';
import commander from 'commander';

const LOG = debug('mlog');

// Set logbook files to be only accessible by the current user
process.umask(0o077);

commander
  .version(require('../../package.json').version)
  .usage('<command> [options]')
  .command('init <directory>', 'Initialize a new repository at the given location.')
  .command('config [command] [options]', 'Set configuration options for the current logbook.')
  .command('add [options]', 'Add an entry to the logbook', { isDefault: true })
  .command('open', 'Open the logbook directory in the file system browser.')
  .command('server [options]', 'Startup a web server to display the rendered markdown log entries.');

commander.parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

if (!commander.runningCommand) {
  LOG('No Child Process Running - Continuing');
} else {
  LOG(`Child Command Specified "${commander.args}" - Skipping Default Actions`);
}

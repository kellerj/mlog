#!/usr/bin/env node

/**
 * @file Command line script to start the logbook server.
 * @author Jonathan Keller
 */
// import debug from 'debug';
// import commander from 'commander';
import chalk from 'chalk';
import opn from 'opn';

import { getConfig } from '../lib/config';

// const LOG = debug('mlog:commands:open');

try {
  process.stdout.write(chalk.yellow(`Starting up Server at http://localhost:${getConfig().serverPort}/\n`));
  // per node standards, it reads the port from this environment variable
  // it's easiest just to simulate that when the user starts the server via these commands
  if (getConfig().serverPort) {
    process.env.PORT = getConfig().serverPort;
  }
  // startup the server by loading server/index.js
  require('../server'); // eslint-disable-line global-require
  opn(`http://localhost:${getConfig().serverPort}/`, { wait: false });
} catch (e) {
  process.stderr.write(`${chalk.red(e.message)}\n`);
  process.exitCode = 1;
}

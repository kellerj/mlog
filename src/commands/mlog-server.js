#!/usr/bin/env node

/**
 * @file Command line script to start the logbook server.
 * @author Jonathan Keller
 */
import chalk from 'chalk';
import open from 'open';

import { getConfig } from '../lib/config.js';

try {
  process.stdout.write(chalk.yellow(`Starting up Server at http://localhost:${getConfig().serverPort}/\n`));
  if (getConfig().serverPort) {
    process.env.PORT = getConfig().serverPort;
  }
  await import('../server/index.js');
  open(`http://localhost:${getConfig().serverPort}/`, { wait: false });
} catch (e) {
  process.stderr.write(`${chalk.red(e.message)}\n`);
  process.exitCode = 1;
}

#!/usr/bin/env node -r babel-register

import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';

import { prepareDirectory, writeHomeConfig, prepareLogbookConfig } from '../lib/config';
import { generateMainIndexPage } from '../lib/main';

const LOG = debug('mlog:commands:init');

commander.usage('<path>')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

const logLocation = commander.args[0];

try {
  prepareDirectory(logLocation);
  writeHomeConfig(logLocation);
  prepareLogbookConfig(logLocation);
  generateMainIndexPage();
  console.log(chalk.green(`${logLocation} Initialized`));
} catch (e) {
  console.log(chalk.red(e.message));
  process.exitCode = 1;
}

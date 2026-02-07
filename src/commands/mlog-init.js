#!/usr/bin/env node

import debug from 'debug';
import { Command } from 'commander';
import chalk from 'chalk';

import { prepareDirectory, writeHomeConfig, prepareLogbookConfig, getConfig } from '../lib/config.js';
import { generateMainIndexPage } from '../lib/main.js';

const LOG = debug('mlog:commands:init');

const program = new Command();

program.usage('<path>')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(program);

const logLocation = program.args[0];

try {
  prepareDirectory(logLocation);
  writeHomeConfig(logLocation);
  prepareLogbookConfig(logLocation);
  generateMainIndexPage();
  console.log(chalk.green(`${logLocation} Initialized`));
  process.stdout.write(JSON.stringify(getConfig(), null, 2));
  process.stdout.write('\n');
} catch (e) {
  console.log(chalk.red(e.message));
  process.exitCode = 1;
}

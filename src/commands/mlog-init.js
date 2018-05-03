#!/usr/bin/env node

import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';
import { yamprint } from 'yamprint';
import { Themes } from 'yamprint-ansi-color';

import { prepareDirectory, writeHomeConfig, prepareLogbookConfig, getConfig } from '../lib/config';
import { generateMainIndexPage } from '../lib/main';

const yp = yamprint.create(Themes.regular);

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
  process.stdout.write(yp(getConfig()));
  process.stdout.write('\n');
} catch (e) {
  console.log(chalk.red(e.message));
  process.exitCode = 1;
}

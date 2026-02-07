#!/usr/bin/env node

import debug from 'debug';
import { Command } from 'commander';
import chalk from 'chalk';

import * as config from '../lib/config.js';
import { generateMainIndexPage } from '../lib/main.js';

const LOG = debug('mlog:commands:config');

function postProcessConfigChange(actionType, optionName) {
  if (optionName === 'categories') {
    generateMainIndexPage();
  }
}

function handleSetValue(optionName, optionValue) {
  LOG('Command: SET %s %s', optionName, optionValue);
  if (!config.validateStringOptionName(optionName)) {
    throw new Error(`Invalid Option Name: ${chalk.yellow(optionName)}`);
  }
  const newConfig = config.updateStringConfig(optionName, optionValue);
  config.saveLogbookConfig(newConfig);
  postProcessConfigChange('set', optionName);
}

function handleAddListValue(optionName, optionValue) {
  LOG('Command: ADD %s %s', optionName, optionValue);
  if (!config.validateListOptionName(optionName)) {
    throw new Error(`Invalid Option Name: ${chalk.yellow(optionName)}`);
  }
  const newConfig = config.addToListConfig(optionName, optionValue);
  config.saveLogbookConfig(newConfig);
  postProcessConfigChange('add', optionName);
}

function handleShowOptions() {
  LOG('Command: SHOW');
  process.stdout.write(JSON.stringify(config.getConfig(), null, 2));
  process.stdout.write('\n');
}

const program = new Command();

program.usage('[command] [options]');
program.command('set <optionName> <optionValue>').action(handleSetValue);
program.command('add <listOptionName> <optionValue>').action(handleAddListValue);
program.command('show').action(handleShowOptions);

try {
  program.parse(process.argv);
} catch (e) {
  process.stderr.write('\n');
  process.stderr.write(chalk.red(e.message));
  process.stderr.write('\n\n');
  process.exitCode = 1;
}

#!/usr/bin/env node -r babel-register

import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';
import { yamprint } from 'yamprint';
import { Themes } from 'yamprint-ansi-color';

import * as config from '../lib/config';

const LOG = debug('mlog:commands:config');

const yp = yamprint.create(Themes.regular);

function handleSetValue(optionName, optionValue) {
  LOG('Command: SET %s %s', optionName, optionValue);
  // check that the option is a good string option
  if (!config.validateStringOptionName(optionName)) {
    throw new Error(`Invalid Option Name: ${chalk.yellow(optionName)}`);
  }
  // update the config
  const newConfig = config.updateStringConfig(optionName, optionValue);
  // save the updated config to JSON (savecurrentconfig)
  config.saveLogbookConfig(newConfig);
}

function handleAddListValue(optionName, optionValue) {
  LOG('Command: ADD %s %s', optionName, optionValue);
  // check that the option is a good list option
  if (!config.validateListOptionName(optionName)) {
    throw new Error(`Invalid Option Name: ${chalk.yellow(optionName)}`);
  }
  // update the config
  const newConfig = config.addToListConfig(optionName, optionValue);
  // save the updated config to JSON (savecurrentconfig)
  config.saveLogbookConfig(newConfig);
}

function handleShowOptions() {
  LOG('Command: SHOW');
  process.stdout.write(yp(config.getConfig()));
  process.stdout.write('\n');
}

commander.usage('[command] [options]');
//  .option('--add <listOptionName> <optionValue>', 'Add an item to an array configuration option.')
//  .option('--set <optionName> <optionValue>')
commander.command('set <optionName> <optionValue>').action(handleSetValue);
commander.command('add <listOptionName> <optionValue>').action(handleAddListValue);
commander.command('show').action(handleShowOptions);

try {
  commander.parse(process.argv);
} catch (e) {
  process.stderr.write('\n');
  process.stderr.write(chalk.red(e.message));
  process.stderr.write('\n\n');
  process.exitCode = 1;
}

// TODO: validate option names
// TODO: validate exclusivity of the command
// TODO: validate defaultCategory against list
// TODO: update config as specified
// TODO: write file
// TODO: if category list added to, rebuild the master index
// TODO: when udpating config, update the global object as well (delete and getConfig)

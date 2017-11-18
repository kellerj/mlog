#!/usr/bin/env node -r babel-register

import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';

import * as config from '../lib/config';

const LOG = debug('mlog:commands:config');

commander.usage('[command] [options]');
//  .option('--add <listOptionName> <optionValue>', 'Add an item to an array configuration option.')
//  .option('--set <optionName> <optionValue>')
commander.command('set <optionName> <optionValue>')
  .action((optionName, optionValue) => {
    LOG('Command: SET %s %s', optionName, optionValue);
    // check that the option is a good string option
    if (!config.validateStringOptionName(optionName)) {
      throw new Error(`Invalid Option Name: ${chalk.yellow(optionName)}`);
    }
    // update the config
    const newConfig = config.updateStringConfig(optionName, optionValue);
    // save the updated config to JSON (savecurrentconfig)
    config.saveLogbookConfig(newConfig);
  });
commander.command('add <listOptionName> <optionValue>')
  .action((optionName, optionValue) => {
    LOG('Command: ADD %s %s', optionName, optionValue);
    // check that the option is a good list option
    if (!config.validateListOptionName(optionName)) {
      throw new Error(`Invalid Option Name: ${chalk.yellow(optionName)}`);
    }
    // update the config
    const newConfig = config.addToListConfig(optionName, optionValue);
    // save the updated config to JSON (savecurrentconfig)
    config.saveLogbookConfig(newConfig);
  });

// LOG('*****\nCOMMAND INPUT:\n*****');
// LOG(commander);

// config.getConfig();

// const logLocation = commander.args[0];

try {
  commander.parse(process.argv);
  // if ( !commander.set && !commander.add)
} catch (e) {
  console.log(chalk.red(e.message));
  process.exit(1);
}

// TODO: validate option names
// TODO: validate exclusivity of the command
// TODO: validate defaultCategory against list
// TODO: update config as specified
// TODO: write file
// TODO: if category list added to, rebuild the master index
// TODO: when udpating config, update the global object as well (delete and getConfig)

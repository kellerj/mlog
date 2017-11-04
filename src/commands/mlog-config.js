import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';

import * as config from '../lib/config';

const LOG = debug('mlog-config');

const knownListOptions = ['categories'];
const knownStringOptions = ['defaultCategory', 'fileNameFormat', 'title'];

commander.version('1.0.0')
  .usage('mlog config [--command] [options]')
  .option('--add <listOptionName> <optionValue>', 'Add an item to an array configuration option.')
  .option('--set <optionName> <optionValue>')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

// const logLocation = commander.args[0];

// try {
//   config.prepareDirectory(logLocation);
//   config.writeHomeConfig(logLocation);
//   config.prepareLogbookConfig(logLocation);
//   console.log(chalk.green(`${logLocation} Initialized`));
// } catch (e) {
//   console.log(chalk.red(e.message));
//   process.exit(1);
// }

// TODO: get the logbook path
// TODO: read the current config
// TODO: validate option names
// TODO: validate exclusivity of the command
// TODO: validate defaultCategory against list
// TODO: update config as specified
// TODO: write file
// TODO: if category list added to, rebuild the master index

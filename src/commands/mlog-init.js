import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';

import * as config from '../lib/config';

const LOG = debug('mlog-init');

commander.version('1.0.0')
  .usage('mlog init <path>')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

const logLocation = commander.args[0];

// TODO: handle missing path

try {
  config.prepareDirectory(logLocation);
  config.writeHomeConfig(logLocation);
  config.prepareLogbookConfig(logLocation);
  console.log(chalk.green(`${logLocation} Initialized`));
} catch (e) {
  console.log(chalk.red(e.message));
  process.exitCode = 1;
}

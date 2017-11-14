import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';

// import * as config from '../lib/config';

const LOG = debug('mlog-add');

commander.version('1.0.0')
  .usage('mlog add [options]')
  .option('-c, --category <categoryName>', 'Category to which to add the given content.')
  .option('-d, --date <YYYY-MM-DD>', 'Date to use for the entry.  Today\'s date will be used if not specified.')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

if (!process.stdin.isTTY) {
  LOG('Starting Read from stdin');
  // https://nodejs.org/api/process.html#process_process_stdin
  process.stdin.setEncoding('utf8');

  let data = '';

  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      data += chunk;
    }
  });
  process.stdin.on('end', () => {
    LOG(data);
    // TODO: write file to indicated path
  });
} else {
  // TODO: output help info
}

// const logLocation = commander.args[0];

try {
  // config.prepareDirectory(logLocation);
  // config.writeHomeConfig(logLocation);
  // config.prepareLogbookConfig(logLocation);
  // console.log(chalk.green(`${logLocation} Initialized`));
} catch (e) {
  console.log(chalk.red(e.message));
  process.exit(1);
}

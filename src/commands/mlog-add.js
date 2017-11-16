#!/usr/bin/env node -r babel-register

import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';

import { importLogEntry } from '../lib/main';

const LOG = debug('mlog:commands:add');

commander.version('1.0.0')
  .usage('mlog add [options]')
  .option('-c, --category <categoryName>', 'Category to which to add the given content.')
  .option('-d, --date <YYYY-MM-DD>', 'Date to use for the entry.  Today\'s date will be used if not specified.')
  .option('-o, --overwrite', 'If an entry already exists for this date, replace it.')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

const categoryName = commander.category;
const entryDate = commander.date;
const overwriteExisting = commander.overwrite;

// const logLocation = commander.args[0];

try {
  // const logBase = getConfig().mlogLocation;

  // TODO: parse, validate and format Date
  // TODO: validate categoryName

  if (!process.stdin.isTTY) {
    LOG('Reading entry from stdin');
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
      // LOG(data);
      // write file to indicated path
      try {
        const logFile = importLogEntry(data, categoryName, entryDate, overwriteExisting);
        console.log(chalk.green(`Saved Log to ${logFile}`));
        // TODO: regenerate category index
      } catch (e) {
        console.log(chalk.red(e.message));
        process.exitCode = 1;
      }
    });
  } else {
    // output help info
    commander.outputHelp();
    process.exitCode = 1;
  }
} catch (e) {
  console.log(chalk.red(e.message));
  process.exitCode = 1;
}

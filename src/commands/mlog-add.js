#!/usr/bin/env node -r babel-register

import debug from 'debug';
import commander from 'commander';
import chalk from 'chalk';
import opn from 'opn';

import { importLogEntry, getCategoryName, getEntryDate, generateCategoryIndexPage } from '../lib/main';

const LOG = debug('mlog:commands:add');

commander.usage('[options]')
  .option('-c, --category <categoryName>', 'Category to which to add the given content.')
  .option('-d, --date <YYYY-MM-DD>', 'Date to use for the entry.  Today\'s date will be used if not specified.')
  .option('-o, --overwrite', 'If an entry already exists for this date, replace it.')
  .option('--open', 'After creating the entry, open the file with the default viewer on your platform.')
  .option('--echo', 'After saving the entry, echo the contents back to the console.')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

try {
  // validate categoryName (the below throws if invalid)
  const categoryName = getCategoryName(commander.category);
  // parse, validate and format Date
  const entryDate = getEntryDate(commander.date);
  const overwriteExisting = commander.overwrite;

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
        process.stdout.write(chalk.green(`Saved Log to ${logFile}\n`));
        // regenerate category index
        generateCategoryIndexPage(categoryName);
        if (commander.echo) {
          process.stdout.write('-'.repeat(80));
          process.stderr.write('\n');
          process.stdout.write(data);
        }
        if (commander.open) {
          opn(logFile, { wait: false });
        }
      } catch (e) {
        process.stderr.write(chalk.red(e.message));
        process.stderr.write('\n');
        process.exitCode = 1;
      }
    });
  } else {
    // output help info
    commander.outputHelp();
    process.exitCode = 1;
  }
} catch (e) {
  process.stderr.write(chalk.red(e.message));
  process.stderr.write('\n');
  process.exitCode = 1;
}

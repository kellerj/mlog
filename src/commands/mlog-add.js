#!/usr/bin/env node

import debug from 'debug';
import { Command } from 'commander';
import chalk from 'chalk';
import open from 'open';

import { importLogEntry, getCategoryName, getEntryDate, generateCategoryIndexPage } from '../lib/main.js';

const LOG = debug('mlog:commands:add');

const program = new Command();

program.usage('[options]')
  .option('-c, --category <categoryName>', 'Category to which to add the given content.')
  .option('-d, --date <YYYY-MM-DD>', 'Date to use for the entry.  Today\'s date will be used if not specified.')
  .option('-o, --overwrite', 'If an entry already exists for this date, replace it.')
  .option('--open', 'After creating the entry, open the file with the default viewer on your platform.')
  .option('--echo', 'After saving the entry, echo the contents back to the console.')
  .parse(process.argv);

const opts = program.opts();

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(program);

try {
  const categoryName = getCategoryName(opts.category);
  const entryDate = getEntryDate(opts.date);
  const overwriteExisting = opts.overwrite;

  if (!process.stdin.isTTY) {
    LOG('Reading entry from stdin');
    process.stdin.setEncoding('utf8');

    let data = '';

    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        data += chunk;
      }
    });
    process.stdin.on('end', () => {
      try {
        const logFile = importLogEntry(data, categoryName, entryDate, overwriteExisting);
        process.stdout.write(chalk.green(`Saved Log to ${logFile}\n`));
        generateCategoryIndexPage(categoryName);
        if (opts.echo) {
          process.stdout.write('-'.repeat(80));
          process.stderr.write('\n');
          process.stdout.write(data);
        }
        if (opts.open) {
          open(logFile, { wait: false });
        }
      } catch (e) {
        process.stderr.write(chalk.red(e.message));
        process.stderr.write('\n');
        process.exitCode = 1;
      }
    });
  } else {
    program.outputHelp();
    process.exitCode = 1;
  }
} catch (e) {
  process.stderr.write(chalk.red(e.message));
  process.stderr.write('\n');
  process.exitCode = 1;
}

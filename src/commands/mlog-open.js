#!/usr/bin/env node

// import debug from 'debug';
// import commander from 'commander';
import chalk from 'chalk';
import opn from 'opn';

import { getConfig } from '../lib/config';

// const LOG = debug('mlog:commands:open');

try {
  opn(getConfig().mlogLocation, { wait: false });
} catch (e) {
  console.log(chalk.red(e.message));
  process.exitCode = 1;
}

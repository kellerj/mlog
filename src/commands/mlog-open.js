#!/usr/bin/env node

import chalk from 'chalk';
import open from 'open';

import { getConfig } from '../lib/config.js';

try {
  open(getConfig().mlogLocation, { wait: false });
} catch (e) {
  console.log(chalk.red(e.message));
  process.exitCode = 1;
}

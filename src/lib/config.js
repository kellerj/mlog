import debug from 'debug';
import fs from 'fs';
import os from 'os';
import path from 'path';

import defaultConfig from './default-config';

const LOG = debug('lib:config');

export function prepareDirectory(logLocation) {
  // Check that given location exists (or can be created) and is writable

  if (!logLocation || logLocation === '/') {
    throw new Error('Blank or root path specified for log location');
  }

  if (fs.existsSync(logLocation)) {
    if (!fs.statSync(logLocation).isDirectory()) {
      throw new Error(`${logLocation} already exists and is not a directory.`);
    }
  } else {
    const parentDir = path.dirname(logLocation);
    LOG(`Path does not exist, checking existence of ${parentDir}`);
    if (!fs.existsSync(parentDir)) {
      throw new Error(`Parent Directory ${parentDir} does not exist.`);
    }
    if (!fs.statSync(parentDir).isDirectory()) {
      throw new Error(`Parent of log location ${parentDir} is not a directory.`);
    }
    try {
      // eslint-disable-next-line no-bitwise
      fs.accessSync(parentDir, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
      throw new Error(`${parentDir} does not have r/w access.`);
    }
    fs.mkdirSync(logLocation);
  }
}

export function writeHomeConfig(logLocation) {
  // Create the home directory config file to keep track of where the logbook is
  const configFileLocation = path.format({ dir: os.homedir(), base: '.mlog-config.json' });
  LOG(`Creating File: ${configFileLocation}`);
  const config = { mlogLocation: logLocation };
  fs.writeFileSync(configFileLocation, JSON.stringify(config, null, 2));
}

export function prepareLogbookConfig(logLocation) {
  // check for config file in target location and create if not there
  const logbookConfigFile = path.format({ dir: logLocation, base: 'logbook-config.json' });
  if (!fs.existsSync(logbookConfigFile)) {
    // Create default config file
    fs.writeFileSync(logbookConfigFile, JSON.stringify(defaultConfig, null, 2));
  }
}

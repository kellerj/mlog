import debug from 'debug';
import fs from 'fs';
import os from 'os';
import path from 'path';

import defaultConfig from './default-config';

const LOG = debug('mlog:lib:config');

function getConfigFileLocation() {
  return path.format({ dir: os.homedir(), base: '.mlog-config.json' });
}

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
  const configFileLocation = getConfigFileLocation();
  LOG(`Creating File: ${configFileLocation}`);
  const config = { mlogLocation: logLocation };
  fs.writeFileSync(configFileLocation, JSON.stringify(config, null, 2));
  return configFileLocation;
}

export function prepareLogbookConfig(logLocation) {
  // check for config file in target location and create if not there
  const logbookConfigFile = path.format({ dir: logLocation, base: 'logbook-config.json' });
  if (!fs.existsSync(logbookConfigFile)) {
    // Create default config file
    fs.writeFileSync(logbookConfigFile, JSON.stringify(defaultConfig, null, 2));
  }
  return logbookConfigFile;
}

export function getConfig() {
  // check if the global config has been loaded, and return that if present
  if (global.logbookConfig) {
    return global.logbookConfig;
  }
  // read the home config File
  const configFileLocation = getConfigFileLocation();
  LOG(`Using base config file: ${configFileLocation}`);
  try {
    fs.accessSync(configFileLocation, fs.constants.R_OK);
  } catch (e) {
    throw new Error('Missing ~/.mlog-config.json file.  Please run mlog init to configure the logbook location before running any other commands.');
  }
  const homeConfig = JSON.parse(fs.readFileSync(configFileLocation, 'utf8'));
  // LOG('Read home config: %s', homeConfig);
  LOG('mlogLocation: %s', homeConfig.mlogLocation);
  const logbookConfigFile = path.join(homeConfig.mlogLocation, 'logbook-config.json');
  LOG('Using logbook config: %s', logbookConfigFile);
  // throw Error if file does not exist or unable to read file
  try {
    fs.accessSync(logbookConfigFile, fs.constants.R_OK);
  } catch (e) {
    throw new Error(`Missing logbook-config.json file in ${homeConfig.mlogLocation}.  Please run mlog init to configure the logbook location before running any other commands.`);
  }
  // read the config in the specified directory
  const logbookConfig = JSON.parse(fs.readFileSync(logbookConfigFile, 'utf8'));
  logbookConfig.mlogLocation = homeConfig.mlogLocation;
  // LOG('Read logbook config: %s', logbookConfig);
  // save the object into the global space
  global.logbookConfig = logbookConfig;
  // return the parsed object
  return logbookConfig;
}

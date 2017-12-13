/**
 * @overview Logbook configuration support methods
 * @module config
 * @author Jonathan Keller
 */
import debug from 'debug';
import fs from 'fs';
import os from 'os';
import path from 'path';

import defaultConfig from './default-config';

const LOG = debug('mlog:lib:config');

const knownListOptions = ['categories'];
const knownStringOptions = ['defaultCategory', 'fileNameFormat', 'title'];
const knownIntegerOptions = ['serverPort'];

/**
 * Logbook configuration object
 * @typedef LogbookConfig
 * @type {object}
 * @property {string}   defaultCategory - The category to use if no category is specified on the command line.
 * @property {string}   fileNameFormat  - the Date format string to use on entry date given.
 * @property {string}   title           - The title of this logbook.
 * @property {string}   mlogLocation    - the absolute path of the logbook
 * @property {string[]} categories      - array of valid categories which can be specified
 */

/**
 * Returns the absolute path for the home path.
 *
 * @return {string}
 * @private
 */
function getConfigFileLocation() {
  return path.format({ dir: os.homedir(), base: '.mlog-config.json' });
}

/**
 * Check that the given option name matches a known configuration item name.
 *
 * @param  {string} optionName
 * @return {boolean}
 */
export function validateStringOptionName(optionName) {
  return knownStringOptions.includes(optionName) || knownIntegerOptions.includes(optionName);
}

/**
 * Check that the given option name matches a known list-type
 * configuration item name.
 *
 * @param  {string} optionName
 * @return {boolean}
 */
export function validateListOptionName(optionName) {
  return knownListOptions.includes(optionName);
}

/**
 * Prepare the directory for the entire logbook.
 *
 * @param  {string} logLocation - The absolute path of the location to prepare.
 */
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

/**
 * Write out the system-level configuration file pointed at the given directory.
 *
 * @param  {string} logLocation - The absolute path of the logbook directory.
 * @return {string}             Absolute path to the created configuration file.
 */
export function writeHomeConfig(logLocation) {
  // Create the home directory config file to keep track of where the logbook is
  const configFileLocation = getConfigFileLocation();
  LOG(`Creating File: ${configFileLocation}`);
  const config = { mlogLocation: logLocation };
  fs.writeFileSync(configFileLocation, JSON.stringify(config, null, 2));
  return configFileLocation;
}

/**
 * Get the current configuration for the application based on the logbook
 * location stored in the home directory and the configuration file stored
 * in that location.
 * @return {LogbookConfig} - the configuration object for the application
 */
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

/**
 * updates a string-value type config property and returns the updated object
 * @param  {string} optionName
 * @param  {string} optionValue
 * @return {LogbookConfig}             a copy of the config object with the update in place.
 */
export function updateStringConfig(optionName, optionValue) {
  // update the config
  if (knownIntegerOptions.includes(optionName)) {
    getConfig()[optionName] = Number.parseInt(optionValue, 10);
  } else {
    getConfig()[optionName] = optionValue;
  }
  const newConfig = Object.assign({}, getConfig());
  // make a copy, and remove the mlogLocation
  delete newConfig.mlogLocation;
  return newConfig;
}

/**
 * updates a string-list-value type config property and returns the updated object
 * @param  {string} optionName
 * @param  {string} optionValue
 * @return {LogbookConfig}             a copy of the config object with the update in place.
 */
export function addToListConfig(optionName, optionValue) {
  // update the config
  getConfig()[optionName].push(optionValue);
  const newConfig = Object.assign({}, getConfig());
  // make a copy, and remove the mlogLocation
  delete newConfig.mlogLocation;
  return newConfig;
}

/**
 * Save the logbook configuration file based on the current config in memory.
 *
 * @param  {LogbookConfig} configObject
 */
export function saveLogbookConfig(configObject) {
  const logLocation = getConfig().mlogLocation;
  // check for config file in target location and create if not there
  const logbookConfigFile = path.format({ dir: logLocation, base: 'logbook-config.json' });
  // Create default config file
  fs.writeFileSync(logbookConfigFile, JSON.stringify(configObject, null, 2));
}

/**
 * Prepare the logbook configuration file based on the default config in the specified directory.
 *
 * @param  {string} logLocation The absolute path to the location to create the config file.
 * @return {string}             The absolute path of the created configuration file.
 */
export function prepareLogbookConfig(logLocation) {
  // check for config file in target location and create if not there
  const logbookConfigFile = path.format({ dir: logLocation, base: 'logbook-config.json' });
  if (!fs.existsSync(logbookConfigFile)) {
    // Create default config file
    fs.writeFileSync(logbookConfigFile, JSON.stringify(defaultConfig, null, 2));
  }
  return logbookConfigFile;
}

export default {};

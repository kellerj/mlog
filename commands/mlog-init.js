import debug from 'debug';
import commander from 'commander';
import fs from 'fs';
import os from 'os';
import path from 'path';


const LOG = debug('mlog-init');

commander.version('1.0.0')
  .usage('mlog init <path>')
  .parse(process.argv);

LOG(commander);

const logLocation = commander.args[0];

if (fs.existsSync(logLocation)) {
  if (!fs.statSync(logLocation).isDirectory()) {
    throw new Error(`${logLocation} already exists and is not a directory.`);
  }
} else {
  const parentDir = path.dirname(logLocation);
  LOG(`Path does not exist, checking existence of ${parentDir}`);
  if (!fs.existsSync(parentDir)) {
    throw new Error(`${parentDir} does not exist.`);
  }
  try {
    // eslint-disable-next-line no-bitwise
    fs.accessSync(parentDir, fs.constants.R_OK | fs.constants.W_OK);
  } catch (e) {
    throw new Error(`${parentDir} does not have r/w access.`);
  }
  fs.mkdirSync(logLocation);
}

const configFileLocation = `${os.homedir()}/.mlog-config`;
const config = { mlogLocation: logLocation };

fs.writeFileSync(configFileLocation, JSON.stringify(config, null, 2));

// TODO: check if path exists
// TODO: create path if does not exist (parent must already exist)
// TODO: check for config file in target location
// TODO: Create default config file

const defaultConfig = {
  categories: [
    'Work Log',
    'Weekly Summary',
  ],
  defaultCategory: 'Work Log',
  fileNameFormat: 'YYYY-MM-DD',
  title: 'Logbook',
};

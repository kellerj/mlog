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

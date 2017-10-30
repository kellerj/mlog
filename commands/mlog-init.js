import debug from 'debug';
import commander from 'commander';
import fs from 'fs';
import os from 'os';

const LOG = debug('mlog-init');

commander.version('1.0.0')
  .usage('mlog init <path>')
  .parse(process.argv);

LOG(commander);

const logLocation = commander.args[0];

const configFileLocation = `${os.homedir()}/.mlog-config`;
const config = { mlogLocation: logLocation };

fs.writeFileSync(configFileLocation, JSON.stringify(config, null, 2));

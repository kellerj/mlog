import { expect } from 'chai';
import { stub } from 'sinon';
import os from 'os';
import fs from 'fs';
import tmp from 'tmp';
import path from 'path';

import * as config from '../../src/lib/config';
// const assert = require('chai').assert;

describe('lib/config', () => {
  describe('writeHomeConfig', () => {
    let tempDir = process.cwd();
    let homeDir = tempDir;
    beforeEach(() => {
      tempDir = tmp.dirSync({ unsafeCleanup: true });
      homeDir = path.format({ dir: tempDir.name, base: 'home' });
      fs.mkdirSync(homeDir);
      stub(os, 'homedir').returns(homeDir);
    });

    afterEach(() => {
      os.homedir.restore();
      tempDir.removeCallback();
    });

    it('creates a file in the home directory named .mlog-config.json', () => {
      config.writeHomeConfig(path.format({ dir: tempDir.name, base: 'logbook' }));
      // console.dir(fs.readdirSync(tempDir.name));
      // console.dir(fs.readdirSync(homeDir));
    });
  });
});

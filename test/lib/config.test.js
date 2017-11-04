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

    // create and remove a temp directory for each test to test the various scenarios
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
      const logbookPath = path.format({ dir: tempDir.name, base: 'logbook' });
      config.writeHomeConfig(logbookPath);
      const homeDirConfigFile = path.format({ dir: homeDir, base: '.mlog-config.json' });
      expect(fs.existsSync(homeDirConfigFile), '.mlog-config.json file was not created')
        .to.equal(true);
      expect(JSON.parse(fs.readFileSync(homeDirConfigFile, 'utf8')).mlogLocation, 'location of mlog not in config file as expected')
        .to.equal(logbookPath);
    });

    it('will overwrite an existing file if present', () => {
      const logbookPath = path.format({ dir: tempDir.name, base: 'logbook' });
      const homeDirConfigFile = path.format({ dir: homeDir, base: '.mlog-config.json' });
      fs.writeFileSync(homeDirConfigFile, 'JUST SOME JUNK DATA', 'utf8');
      config.writeHomeConfig(logbookPath);
      expect(JSON.parse(fs.readFileSync(homeDirConfigFile, 'utf8')).mlogLocation, 'location of mlog not in config file as expected')
        .to.equal(logbookPath);
    });
  });
  describe('prepareDirectory', () => {
    // it('should abort if the path is blank or the root path', () => {
    //
    // });
    //
    // it('should abort if the parent of the path given does not exist', () => {
    //
    // });
    //
    // it('should abort if the parent of the path given exists and is not a directory', () => {
    //
    // });
    //
    // it('should abort if the parent of the path given is not r/w', () => {
    //
    // });
    //
    // it('should create the directory if it does not exist', () => {
    //
    // });
    //
    // it('should not replace the config file if one already exists', () => {
    //
    // });
  });
  describe('prepareLogbookConfig', () => {
    // it('should create a logbook-config.json file', () => {
    //
    // });
    // it('the logbook-config.json file should contain the default configuration settings', () => {
    //
    // });
    // it('should not replace the config file if one already exists', () => {
    //
    // });
  });
});

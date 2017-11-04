import { expect } from 'chai';
import { stub } from 'sinon';
import os from 'os';
import fs from 'fs';
import tmp from 'tmp';
import path from 'path';

import * as config from '../../src/lib/config';
import defaultConfig from '../../src/lib/default-config';

describe('lib/config', () => {
  let tempDir = { name: path.format({ dir: process.cwd(), base: 'temp' }) };
  let homeDir = path.format({ dir: tempDir.name, base: 'home' });
  let parentDir = path.format({ dir: tempDir.name, base: 'parent' });

  // create and remove a temp directory for each test to test the various scenarios
  beforeEach(() => {
    tempDir = tmp.dirSync({ unsafeCleanup: true });
    homeDir = path.format({ dir: tempDir.name, base: 'home' });
    parentDir = path.format({ dir: tempDir.name, base: 'parent' });
    fs.mkdirSync(homeDir);
    stub(os, 'homedir').returns(homeDir);
  });

  afterEach(() => {
    os.homedir.restore();
    if (fs.existsSync(parentDir)) {
      fs.chmodSync(parentDir, '755');
    }
    tempDir.removeCallback();
  });

  describe('writeHomeConfig', () => {
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
    it('should abort if the path is blank or the root path', () => {
      expect(config.prepareDirectory.bind(config, ''), 'empty string').to.throw('Blank or root path specified for log location');
      expect(config.prepareDirectory.bind(config, undefined), 'undefined').to.throw('Blank or root path specified for log location');
      expect(config.prepareDirectory.bind(config, null), 'null').to.throw('Blank or root path specified for log location');
      expect(config.prepareDirectory.bind(config, '/'), 'root path').to.throw('Blank or root path specified for log location');
    });

    it('should abort if the parent of the path given does not exist', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });

      expect(config.prepareDirectory.bind(config, logbookPath)).to.throw(`Parent Directory ${parentDir} does not exist.`);
    });

    it('should abort if the path exists and is not a directory', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      fs.mkdirSync(parentDir);

      fs.writeFileSync(logbookPath, 'JUST SOME JUNK DATA', 'utf8');
      expect(config.prepareDirectory.bind(config, logbookPath)).to.throw(`${logbookPath} already exists and is not a directory.`);
    });

    it('should not fail if the path already exists', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      fs.mkdirSync(parentDir);
      fs.mkdirSync(logbookPath);

      config.prepareDirectory(logbookPath);
    });

    it('should abort if the parent of the path given exists and is not a directory', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });

      fs.writeFileSync(parentDir, 'JUST SOME JUNK DATA', 'utf8');
      expect(config.prepareDirectory.bind(config, logbookPath)).to.throw(`Parent of log location ${parentDir} is not a directory.`);
    });

    it('should abort if the parent of the path given is not r/w', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      fs.mkdirSync(parentDir);
      fs.chmodSync(parentDir, '000');
      expect(config.prepareDirectory.bind(config, logbookPath)).to.throw(`${parentDir} does not have r/w access.`);
    });

    it('should create the directory if it does not exist', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      fs.mkdirSync(parentDir);
      config.prepareDirectory(logbookPath);
      expect(fs.existsSync(logbookPath)).to.equal(true);
    });
  });

  describe('prepareLogbookConfig', () => {
    it('should create a logbook-config.json file', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      const configFileName = path.format({ dir: logbookPath, base: 'logbook-config.json' });
      fs.mkdirSync(parentDir);
      fs.mkdirSync(logbookPath);
      config.prepareLogbookConfig(logbookPath);
      expect(fs.existsSync(configFileName)).to.equal(true);
    });

    it('the logbook-config.json file should contain the default configuration settings', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      const configFileName = path.format({ dir: logbookPath, base: 'logbook-config.json' });
      fs.mkdirSync(parentDir);
      fs.mkdirSync(logbookPath);
      config.prepareLogbookConfig(logbookPath);
      expect(JSON.parse(fs.readFileSync(configFileName, 'utf8'))).to.deep.equal(defaultConfig);
    });

    it('should not replace the config file if one already exists', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      const configFileName = path.format({ dir: logbookPath, base: 'logbook-config.json' });
      fs.mkdirSync(parentDir);
      fs.mkdirSync(logbookPath);
      fs.writeFileSync(configFileName, 'JUST SOME JUNK DATA', 'utf8');
      config.prepareLogbookConfig(logbookPath);
      expect(fs.readFileSync(configFileName, 'utf8')).to.equal('JUST SOME JUNK DATA');
    });
  });
});

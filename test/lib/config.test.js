import { expect } from 'chai';
import { stub, spy } from 'sinon';
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

  describe('#writeHomeConfig', () => {
    it('returns the path to the config file', () => {
      const logbookPath = path.format({ dir: tempDir.name, base: 'logbook' });
      const result = config.writeHomeConfig(logbookPath);
      const homeDirConfigFile = path.format({ dir: homeDir, base: '.mlog-config.json' });
      expect(result).to.equal(homeDirConfigFile);
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

  describe('#prepareDirectory', () => {
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

  describe('#prepareLogbookConfig', () => {
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

    it('should return the path to the config file', () => {
      const logbookPath = path.format({ dir: parentDir, base: 'logbook' });
      fs.mkdirSync(parentDir);
      fs.mkdirSync(logbookPath);
      const result = config.prepareLogbookConfig(logbookPath);
      const configFileName = path.format({ dir: logbookPath, base: 'logbook-config.json' });
      expect(result).to.equal(configFileName);
    });
  });

  describe('#getConfig', () => {
    let logbookPath = path.format({ dir: tempDir.name, base: 'logbook' });
    let logbookConfigFile = path.join(logbookPath, 'logbook-config.json');
    let homeDirConfigFile = '';
    beforeEach(() => {
      logbookPath = path.format({ dir: tempDir.name, base: 'logbook' });
      logbookConfigFile = path.join(logbookPath, 'logbook-config.json');
      homeDirConfigFile = config.writeHomeConfig(logbookPath);
      config.prepareDirectory(logbookPath);
      config.prepareLogbookConfig(logbookPath);
      spy(fs, 'readFileSync');
    });

    afterEach(() => {
      delete global.logbookConfig;
      delete global.mlogLocation;
      fs.readFileSync.restore();
    });


    it('should read the logbook directory from the homeDir config file', () => {
      config.getConfig();
      expect(fs.readFileSync.calledWith(homeDirConfigFile, 'utf8')).to.equal(true, `did not attempt to read the main config file: ${JSON.stringify(fs.readFileSync.getCalls())}`);
    });
    it('should read the config file from the current logbook path', () => {
      config.getConfig();
      expect(fs.readFileSync.calledWith(logbookConfigFile, 'utf8')).to.equal(true, `did not attempt to read the logbook config file: ${JSON.stringify(fs.readFileSync.getCalls())}`);
    });
    it('should throw an error if the homeDir config file does not exist', () => {
      fs.unlinkSync(homeDirConfigFile);
      expect(() => config.getConfig()).to.throw(/.*Missing.*\.mlog-config.json.*/);
    });
    it('should throw an error if the logbook path does not contain a readable config file', () => {
      fs.unlinkSync(logbookConfigFile);
      expect(() => config.getConfig()).to.throw(/.*Missing.*logbook-config.json.*/);
    });
    it('should read the logbook config file and return the contents', () => {
      const result = config.getConfig();
      expect(result).to.be.an('object');
      expect(result).to.include.all.keys('categories', 'defaultCategory', 'fileNameFormat', 'title', 'mlogLocation');
    });
    it('should save the object into the globals space', () => {
      const result = config.getConfig();
      const expectedObject = Object.assign({}, result);
      expectedObject.mlogLocation = logbookPath;
      expect(global.logbookConfig).to.deep.equal(result);
    });
    it('should read the data from globals and *not* read from the file if present in global', () => {
      global.logbookConfig = { dummyObject: true };
      const result = config.getConfig();
      expect(fs.readFileSync.notCalled).to.equal(true, 'readFileSync should not have been called');
      expect(result).to.equal(global.logbookConfig);
    });
  });
});

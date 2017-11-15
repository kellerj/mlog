import { expect, assert } from 'chai';
import { stub } from 'sinon';
import os from 'os';
import fs from 'fs';
import tmp from 'tmp';
import path from 'path';

import * as main from '../../src/lib/main';

context('lib/main', () => {
  let tempDir = { name: path.format({ dir: process.cwd(), base: 'temp' }) };
  let homeDir = path.format({ dir: tempDir.name, base: 'home' });
  let logbookPath = path.format({ dir: tempDir.name, base: 'logbook' });
  beforeEach(() => {
    tempDir = tmp.dirSync({ unsafeCleanup: true });
    homeDir = path.format({ dir: tempDir.name, base: 'home' });
    logbookPath = path.format({ dir: tempDir.name, base: 'logbook' });
    fs.mkdirSync(homeDir);
    fs.mkdirSync(logbookPath);
    stub(os, 'homedir').returns(homeDir);

    global.logbookConfig = {
      mlogLocation: logbookPath,
      categories: [
        'ACategory',
        'AnotherCategory',
        'Work Log',
        'Weekly Summary',
        'A Category With Multiple Spaces',
      ],
      defaultCategory: 'ACategory',
      fileNameFormat: 'YYYY-MM-DD',
      title: 'MochaTests',
    };
  });

  afterEach(() => {
    delete global.logbookConfig;
    os.homedir.restore();
    if (fs.existsSync(logbookPath)) {
      fs.chmodSync(logbookPath, '755');
    }
    tempDir.removeCallback();
  });


  describe('#getCategoryPath', () => {
    it('should build a path within the configured mlogLocation', () => {
      const result = main.getCategoryPath('ACategory');
      expect(result).to.include(logbookPath);
      expect(result).to.equal(path.join(logbookPath, 'ACategory'));
    });
    it('should create the directory if it does not exist', () => {
      const result = main.getCategoryPath('ACategory');
      expect(fs.existsSync(result), 'directory does not exist');
      expect(fs.statSync(result).isDirectory(), 'given path is not a directory');
    });
    it('should throw an error if the directory is not writable', () => {
      // calling once to create the path
      const categoryPath = main.getCategoryPath('ACategory');
      fs.chmodSync(categoryPath, '000');
      expect(() => main.getCategoryPath('ACategory')).to.throw();
      fs.chmodSync(categoryPath, '755');
    });
  });
  describe('#getCategoryName', () => {
    it('should use the default category if none given', () => {
      const result = main.getCategoryName(undefined);
      expect(result).to.equal(global.logbookConfig.defaultCategory);
    });
    it('should match against the category list in a case insensitive manner', () => {
      const result = main.getCategoryName('anothercategory');
      expect(result).to.match(/anothercategory/i);
    });
    it('should return the category name using the case from the configuration', () => {
      const result = main.getCategoryName('anothercategory');
      expect(result).to.equal('AnotherCategory');
    });
    it('should throw an error if the category does not exist', () => {
      expect(() => main.getCategoryName('Not A Category')).to.throw();
    });
    it('should replace all spaces in the name with underscores', () => {
      let result = main.getCategoryName('Work Log');
      expect(result).to.equal('Work_Log');
      result = main.getCategoryName('A Category With Multiple Spaces');
      expect(result).to.equal('A_Category_With_Multiple_Spaces');
    });
  });
  describe.skip('#importLogEntry', () => {
    it('should fail if the entry text is blank', () => {
      assert.fail();
    });
    it('should use the date given for the file', () => {
      assert.fail();
    });
    it('should use the current date if no date given', () => {
      assert.fail();
    });
    it('should use the default category if none given', () => {
      assert.fail();
    });
    it('should fail if the file already exists and the overwrite flag is not set', () => {
      assert.fail();
    });
    it('should create a file with the appropriate name and location', () => {
      assert.fail();
    });
    it('should return the path of the just-created file', () => {
      assert.fail();
    });
  });
});

import { expect } from 'chai';
import sinon from 'sinon';
import os from 'os';
import fs from 'fs';
import tmp from 'tmp';
import path from 'path';
import dateFns from 'date-fns';

import * as main from '../../src/lib/main';

const sandbox = sinon.createSandbox();

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
    sandbox.stub(os, 'homedir').returns(homeDir);

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
    sandbox.restore();
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
      expect(fs.existsSync(result), 'directory does not exist').to.be.true; // eslint-disable-line no-unused-expressions
      expect(fs.statSync(result).isDirectory(), 'given path is not a directory').to.be.true; // eslint-disable-line no-unused-expressions
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

  describe('#importLogEntry', () => {
    it('should fail if the entry text is blank', () => {
      expect(() => main.importLogEntry('')).to.throw();
    });
    it('should use the date given for the file', () => {
      const resultingFileName = main.importLogEntry('# New Log Entry', 'Work Log', '2017-11-10');
      expect(path.basename(resultingFileName)).to.equal('2017-11-10.md');
    });
    it('should use the current date if no date given', () => {
      const resultingFileName = main.importLogEntry('# New Log Entry', 'Work Log');
      const todaysDate = dateFns.format(new Date(), global.logbookConfig.fileNameFormat);
      expect(path.basename(resultingFileName)).to.equal(`${todaysDate}.md`);
    });
    it('should use the default category if none given', () => {
      const resultingFileName = main.importLogEntry('# New Log Entry');
      expect(resultingFileName).to.include(global.logbookConfig.defaultCategory.replace(/ /g, '_'));
    });
    it('should fail if the file already exists and the overwrite flag is not set', () => {
      // run once to create the file
      const resultingFileName = main.importLogEntry('# New Log Entry', 'Work Log', '2017-11-10');
      // make sure it exists
      expect(fs.existsSync(resultingFileName), `${resultingFileName} does not exist after method call.`);
      expect(() => main.importLogEntry('# New Log Entry', 'Work Log', '2017-11-10')).to.throw();
    });
    it('should create a file with the appropriate name and location', () => {
      const resultingFileName = main.importLogEntry('# New Log Entry', 'Work Log', '2017-11-10');
      expect(resultingFileName, 'resulting file name should not have been unset').to.be.ok; // eslint-disable-line no-unused-expressions
      expect(fs.existsSync(resultingFileName), `${resultingFileName} does not exist after method call.`);
    });
  });

  describe.skip('#generateCategoryIndexPage', () => {
    it('should return the path to the index.md file', () => {
      const categoryPath = main.getCategoryPath('Work Log');
      const result = main.generateCategoryIndexPage('Work Log');
      expect(result).to.equal(path.join(categoryPath, 'index.md'));
    });
    it('should create a file named index.md in the category directory', () => {
      const categoryPath = main.getCategoryPath('Work Log');
      main.generateCategoryIndexPage('Work Log');
      expect(fs.existsSync(path.join(categoryPath, 'index.md'))).to.equal(true, 'index.md file not created');
    });
    it('should read the files from the category directory', () => {
      const categoryPath = main.getCategoryPath('Work Log');
      sandbox.mock(fs).expects('readdirSync').once().withArgs(categoryPath);
      main.generateCategoryIndexPage('Work Log');
      sandbox.mock(fs).verify();
    });
    it('must pass a list of the file names to the buildCategoryIndexFile() function', () => {
      sandbox.spy(main, 'buildCategoryIndexFile');
      // TODO: create the files in the path here
      const categoryPath = main.getCategoryPath('Work Log');
      fs.writeFileSync(path.join(categoryPath, '2017-09-28.md'), '# Test File 1');
      fs.writeFileSync(path.join(categoryPath, '2017-09-29.md'), '# Test File 2');
      fs.writeFileSync(path.join(categoryPath, '2017-09-30.md'), '# Test File 3');
      expect(main.buildCategoryIndexFile.calledWith('Work Log', [
        { name: '2017-09-28.md' },
        { name: '2017-09-29.md' },
        { name: '2017-09-30.md' },
      ]));
    });
    it('should not pass the index file in the list of files linked to', () => {
      sandbox.spy(main, 'buildCategoryIndexFile');
      // TODO: create the files in the path here
      const categoryPath = main.getCategoryPath('Work Log');
      fs.writeFileSync(path.join(categoryPath, 'index.md'), '# Category Index File');
      fs.writeFileSync(path.join(categoryPath, '2017-09-28.md'), '# Test File 1');
      fs.writeFileSync(path.join(categoryPath, '2017-09-29.md'), '# Test File 2');
      fs.writeFileSync(path.join(categoryPath, '2017-09-30.md'), '# Test File 3');
      expect(main.buildCategoryIndexFile.calledWith('Work Log', [
        { name: '2017-09-28.md' },
        { name: '2017-09-29.md' },
        { name: '2017-09-30.md' },
      ]));
    });
  });

  describe('#buildCategoryIndexFile', () => {
    it('should not fail when the passed in list is empty or null', () => {
      expect(() => main.buildCategoryIndexFile(
        'Work Log',
        [],
      ), 'empty file list').to.not.throw();
      expect(() => main.buildCategoryIndexFile(
        'Work Log',
        null,
      ), 'null file list').to.not.throw();
    });
    it('should include the category name in a header line at the start of the file', () => {
      const result = main.buildCategoryIndexFile(
        'Work Log',
        [
          { name: '2017-09-28.md' },
          { name: '2017-09-29.md' },
          { name: '2017-09-30.md' },
        ],
      );
      expect(result.split('\n')[0]).to.match(/^# .*Work Log.*/);
    });
    it('should include markdown links for each of the given files', () => {
      const result = main.buildCategoryIndexFile(
        'Work Log',
        [
          { name: '2017-09-28.md' },
          { name: '2017-09-29.md' },
          { name: '2017-09-30.md' },
        ],
      );
      expect(result).to.match(/\[2017-09-28\]\(2017-09-28\.md\)/);
      expect(result).to.match(/\[2017-09-29\]\(2017-09-29\.md\)/);
      expect(result).to.match(/\[2017-09-30\]\(2017-09-30\.md\)/);
    });
    it('should order the files in reverse sort order (date descending)', () => {
      const result = main.buildCategoryIndexFile(
        'Work Log',
        [
          { name: '2017-09-28.md' },
          { name: '2017-09-29.md' },
          { name: '2017-09-30.md' },
        ],
      );
      expect(result).to.match(/2017-09-30(.|[\s\S])*?2017-09-29(.|[\s\S])*?2017-09-28/m);
    });
  });
});

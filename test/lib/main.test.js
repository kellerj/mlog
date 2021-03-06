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
    // require('debug')('test')(`Removing ${tempDir.name}`);
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
      expect(fs.existsSync(result), 'directory does not exist').to.equal(true);
      expect(fs.statSync(result).isDirectory(), 'given path is not a directory').to.equal(true);
    });
    it('should throw an error if the directory is not writable', () => {
      // calling once to create the path
      const categoryPath = main.getCategoryPath('ACategory');
      fs.chmodSync(categoryPath, '000');
      expect(() => main.getCategoryPath('ACategory')).to.throw();
      fs.chmodSync(categoryPath, '755');
    });
    it('should replace all spaces in the name with underscores', () => {
      let result = main.getCategoryPath('Work Log');
      expect(result).to.match(/Work_Log$/);
      result = main.getCategoryPath('A Category With Multiple Spaces');
      expect(result).to.match(/A_Category_With_Multiple_Spaces$/);
    });
  });
  describe('#getCategoryName', () => {
    it('should use the default category if none given', () => {
      let result = main.getCategoryName(undefined);
      expect(result).to.equal(global.logbookConfig.defaultCategory, 'undefined categoryName');
      result = main.getCategoryName(null);
      expect(result).to.equal(global.logbookConfig.defaultCategory, 'null categoryName');
      result = main.getCategoryName('');
      expect(result).to.equal(global.logbookConfig.defaultCategory, 'empty string categoryName');
      result = main.getCategoryName('   ');
      expect(result).to.equal(global.logbookConfig.defaultCategory, 'spaces categoryName');
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

  describe('#generateCategoryIndexPage', () => {
    it('should return the path to the index.md file', () => {
      const categoryPath = main.getCategoryPath(main.getCategoryName('Work Log'));
      const result = main.generateCategoryIndexPage('Work Log');
      expect(result).to.equal(path.join(categoryPath, 'index.md'));
    });
    it('should create a file named index.md in the category directory', () => {
      const categoryPath = main.getCategoryPath(main.getCategoryName('Work Log'));
      main.generateCategoryIndexPage('Work Log');
      expect(fs.existsSync(path.join(categoryPath, 'index.md'))).to.equal(true, 'index.md file not created');
    });
    it('should read the files from the category directory', () => {
      const categoryPath = main.getCategoryPath(main.getCategoryName('Work Log'));
      sandbox.mock(fs).expects('readdirSync').once().withArgs(categoryPath)
        .callThrough();
      main.generateCategoryIndexPage('Work Log');
      sandbox.mock(fs).verify();
    });
    it('should write the result of the buildCategoryIndexFile function to the file', () => {
      // create the files in the path here
      const categoryPath = main.getCategoryPath(main.getCategoryName('Work Log'));
      fs.writeFileSync(path.join(categoryPath, '2017-09-28.md'), '# Test File 1');
      fs.writeFileSync(path.join(categoryPath, '2017-09-29.md'), '# Test File 2');
      fs.writeFileSync(path.join(categoryPath, '2017-09-30.md'), '# Test File 3');
      const indexFile = main.generateCategoryIndexPage('Work Log');
      expect(fs.readFileSync(indexFile, 'utf8')).to.equal(main.buildCategoryIndexFile('Work Log', [
        { name: '2017-09-28.md', title: 'Test File 1' },
        { name: '2017-09-29.md', title: 'Test File 2' },
        { name: '2017-09-30.md', title: 'Test File 3' },
      ]));
    });
    it('should not include the index file', () => {
      const categoryPath = main.getCategoryPath('Work Log');
      fs.writeFileSync(path.join(categoryPath, 'index.md'), '# Category Index File');
      fs.writeFileSync(path.join(categoryPath, '2017-09-28.md'), '# Test File 1');
      fs.writeFileSync(path.join(categoryPath, '2017-09-29.md'), '# Test File 2');
      fs.writeFileSync(path.join(categoryPath, '2017-09-30.md'), '# Test File 3');
      const indexFile = main.generateCategoryIndexPage('Work Log');
      // console.log(fs.readFileSync(indexFile, 'utf8'));
      expect(fs.readFileSync(indexFile, 'utf8')).to.not.match(/index\.md/);
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
          { name: '2017-09-28.md', title: '2017-09-28' },
          { name: '2017-09-29.md', title: '2017-09-29' },
          { name: '2017-09-30.md', title: '2017-09-30' },
        ],
      );
      expect(result.split('\n')[0]).to.match(/^# .*Work Log.*/);
    });
    it('should include markdown links for each of the given files', () => {
      const result = main.buildCategoryIndexFile(
        'Work Log',
        [
          { name: '2017-09-28.md', title: '2017-09-28' },
          { name: '2017-09-29.md', title: '2017-09-29' },
          { name: '2017-09-30.md', title: '2017-09-30' },
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
          { name: '2017-09-28.md', title: '2017-09-28' },
          { name: '2017-09-29.md', title: '2017-09-29' },
          { name: '2017-09-30.md', title: '2017-09-30' },
        ],
      );
      expect(result).to.match(/2017-09-30(.|[\s\S])*?2017-09-29(.|[\s\S])*?2017-09-28/m);
    });
  });

  describe('#getMarkdownPageTitle', () => {
    it('should return right string when parsable', () => {
      expect(main.getMarkdownPageTitle('# The Title\n\nMore Text', 'fileName.md')).to.equal('The Title', 'Parsing Failed for: "# The Title"');
      expect(main.getMarkdownPageTitle('#   The Title  \n\nMore Text', 'fileName.md')).to.equal('The Title', 'Parsing Failed for: "#   The Title  "');
      expect(main.getMarkdownPageTitle('## The Title\n\nMore Text', 'fileName.md')).to.equal('The Title', 'Parsing Failed for: "## The Title"');
      expect(main.getMarkdownPageTitle('#The Title\n\nMore Text', 'fileName.md')).to.equal('The Title', 'Parsing Failed for: "#The Title"');
    });
    it('should return the name of the file without the extension if can\'t parse the first line', () => {
      expect(main.getMarkdownPageTitle('No Header On First Line', 'fileName.md')).to.equal('fileName');
    });
  });
});

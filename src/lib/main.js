/**
 * @overview Functions related to the main functionality of
 * maintaining the logbook files and strucutre.
 * @module lib/main
 * @author Jonathan Keller
 */
import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { format, parse } from 'date-fns';

import { getConfig } from './config';

const LOG = debug('mlog:lib:main');

/**
 * Given an optional date string from the command line, obtain and format the date
 * as specified in the configuration for the logbook.
 *
 * @param  {string} [entryDateString] A string in a parsable date format.
 * @return {string}                   The date reformatted as per the config.
 */
export function getEntryDate(entryDateString) {
  // set to now if no input string
  let entryDate;
  // if no date given, use the current date
  if (!entryDateString) {
    entryDate = new Date();
  } else {
    // if input string, parse the date and throw if invalid
    entryDate = parse(entryDateString);
  }

  // format the parsed date and return it
  return format(entryDate, getConfig().fileNameFormat);
}

/**
 * getCategoryName - Description
 *
 * @param {string} categoryName Description
 *
 * @returns {string} Description
 */
export function getCategoryName(categoryName) {
  let adjustedCategoryName = categoryName;
  // confirm that categoryName present, use default if not given
  if (!categoryName || !categoryName.trim()) {
    adjustedCategoryName = getConfig().defaultCategory;
  }

  // check if good category name
  // replace with one from list so case matches
  // LOG('Scanning Categories: %s', getConfig().categories);
  // LOG(`Testing element ${e} against ${regex} : result: ${regex.test(e)}`);
  const regex = RegExp(`^${adjustedCategoryName.trim()}$`, 'i');
  adjustedCategoryName = getConfig().categories.find(e => regex.test(e));
  // throw an error if a bad category name
  if (!adjustedCategoryName) {
    throw new Error(`Unknown Category: ${categoryName}`);
  }

  return adjustedCategoryName;
}

/**
 * Create a file system name from a category name.
 *
 * @param {string} categoryName
 * @returns {string}
 */
function convertCategoryNameToFileSystemName(categoryName) {
  return categoryName.replace(/ /g, '_');
}

/**
 * getCategoryPath - Description
 *
 * @param {string} categoryName
 * @returns {string}
 */
export function getCategoryPath(categoryName) {
  if (!categoryName) {
    categoryName = getCategoryName(categoryName);
  }
  // build the path for the given category
  const categoryPath = path.join(
    getConfig().mlogLocation,
    convertCategoryNameToFileSystemName(categoryName),
  );
  // test that it exists and is writable
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath);
  }
  try {
    // eslint-disable-next-line no-bitwise
    fs.accessSync(categoryPath, fs.constants.W_OK | fs.constants.R_OK);
  } catch (e) {
    throw new Error(`Unable to write to ${categoryPath}`);
  }
  return categoryPath;
}

/**
 * importLogEntry - Take the given text and save it to a logbook entry file.
 *
 * @param {string}  entryText         The contents to write to the entry file.
 * @param {string}  [categoryName]    Category to use, the path will be derived from this value.
 * @param {string}  [entryDateString] The date to use for the file name in YYYY-MM-DD format.
 * @param {boolean} [overwrite=false] Whether to overwrite an existing entry file if present.
 *
 * @returns {string} The path of the logfile entry created.
 */
export function importLogEntry(entryText, categoryName, entryDateString, overwrite = false) {
  // confirm that entry text present
  if (!entryText) {
    throw new Error('No entryText given for the log entry');
  }
  const entryPath = getCategoryPath(categoryName);
  const entryDate = getEntryDate(entryDateString);
  // check if the date-named file already exists
  const entryFile = path.format({
    dir: entryPath,
    name: entryDate,
    ext: '.md',
  });
  if (!overwrite && fs.existsSync(entryFile)) {
    throw new Error('Entry for the given date already exists.  Use the --overwrite flag if you want to replace it.');
  }
  // create the file and save the entryText to it
  LOG('Attempting to write file: %s', entryFile);
  fs.writeFileSync(entryFile, entryText);
  // return the path to the new file
  return entryFile;
}

/**
 * buildCategoryIndexFile - Builds the markdown category index file contents from a list of files.
 *
 * @param {string} categoryName - Category name for which to regenerate the index.
 * @param {Object[]} logFileList - List of objects containing information on the logbook files in the category's Directory.
 * @param {string} logFileList[].name - The name of the file within the directory
 *
 * @returns {string} The contents of the category index file
 */
export function buildCategoryIndexFile(categoryName, logFileList) {
  // build header with category name
  let fileContents = `# ${categoryName}\n\n`;
  if (logFileList) {
    // TODO: build list of files in reverse date order
    logFileList.sort((a, b) => (b.name.localeCompare(a)));
    logFileList.forEach((file) => {
      fileContents += `* [${path.basename(file.name, '.md')}](${file.name})\n`;
    });
    // TODO: pull the header from the file and use as the link label?
  }
  fileContents += `\n\n> Generated at: ${new Date()}`;
  LOG(fileContents);
  return fileContents;
}

/**
 * generateCategoryIndexPage - Creates or updates the index file for a given
 * category based on the files in its directory.
 *
 * @param {string} categoryName Category name for which to regenerate the index.
 *
 * @returns {string} Path to the file just created/updated.
 */
export function generateCategoryIndexPage(categoryName) {
  // get the path for the categoryName
  const categoryPath = getCategoryPath(categoryName);
  // iterate over the list of files in the category path
  LOG(`Scanning CategoryPath: ${categoryPath}`);
  const fileNameList = fs.readdirSync(categoryPath);
  LOG(`Found Files: ${fileNameList}`);
  const fileList = fileNameList.filter(file => (file !== 'index.md')).map(file => ({ name: file }));
  // save the file
  const indexFileName = path.join(categoryPath, 'index.md');
  // console.log(`Generating file with parameters: ${categoryName} / ${JSON.stringify(fileList)}`);
  fs.writeFileSync(indexFileName, buildCategoryIndexFile(categoryName, fileList));
  return indexFileName;
}

/**
 * Builds the markdown index file contents from a list of categories.
 *
 * @param {string} title - Category name for which to regenerate the index.
 * @param {Object[]} categoryList - List of categories which have files
 * @param {string} categoryList[].name
 * @param {string} categoryList[].directoryName
 *
 * @returns {string} The contents of the index file
 */
export function buildMainIndexFile(title, categoryList) {
  // build header with category name
  let fileContents = `# ${title}\n\n`;
  if (categoryList) {
    // TODO: build list of files in reverse date order
    categoryList.sort((a, b) => (b.name.localeCompare(a)));
    categoryList.forEach((category) => {
      fileContents += `* [${category.name}](${category.directoryName}/index.md)\n`;
    });
  }
  fileContents += `\n\n> Generated at: ${new Date()}`;
  LOG(fileContents);
  return fileContents;
}

/**
 * Creates or updates the index file for the current set of categories in the config.
 *
 * @returns {string} Path to the file just created/updated.
 */
export function generateMainIndexPage() {
  const categoryList = getConfig().categories.map(cat => ({
    name: cat,
    directoryName: convertCategoryNameToFileSystemName(cat),
  }));
  LOG(`Found Categories: ${categoryList}`);
  // save the file
  const indexFileName = path.join(getConfig().mlogLocation, 'index.md');
  fs.writeFileSync(indexFileName, buildMainIndexFile(getConfig().title, categoryList));
  return indexFileName;
}


export default {};

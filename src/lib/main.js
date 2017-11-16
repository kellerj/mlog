import debug from 'debug';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';

import { getConfig } from './config';

const LOG = debug('mlog:lib:main');

export function getCategoryPath(categoryName) {
  // build the path for the given category
  const categoryPath = path.join(getConfig().mlogLocation, categoryName);
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

export function getCategoryName(categoryName) {
  let adjustedCategoryName = categoryName;
  // confirm that categoryName present, use default if not given
  if (!categoryName) {
    adjustedCategoryName = getConfig().defaultCategory;
  }

  // check if good category name
  // replace with one from list so case matches
  // LOG('Scanning Categories: %s', getConfig().categories);
  // LOG(`Testing element ${e} against ${regex} : result: ${regex.test(e)}`);
  const regex = RegExp(`^${adjustedCategoryName.trim()}$`, 'i');
  adjustedCategoryName = getConfig().categories.find(e =>
    regex.test(e));
  // throw an error if a bad category name
  if (!adjustedCategoryName) {
    throw new Error(`Unknown Category: ${categoryName}`);
  }

  return adjustedCategoryName.replace(/ /g, '_');
}

export function importLogEntry(entryText, categoryName, entryDateString, overwrite = false) {
  // confirm that entry text present
  if (!entryText) {
    throw new Error('No entryText given for the log entry');
  }
  const entryPath = getCategoryPath(getCategoryName(categoryName));
  let entryDate = entryDateString;
  // if no date given, use the current date
  if (!entryDate) {
    entryDate = format(new Date(), getConfig().fileNameFormat);
  }
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
 * generateCategoryIndexPage - Creates or updates the index file for a given
 * category based on the files in its directory.
 *
 * @param {string} categoryName Category name for which to regenerate the index.
 *
 * @returns {string} Path to the file just created/updated.
 */
export function generateCategoryIndexPage(categoryName) {
  // TODO: get the path for the categoryName
  // TODO: iterate over the list of files in the category path
  // TODO: save the file
}


/**
 * buildCategoryIndexFile - Builds the markdown category index file contents from a list of files.
 *
 * @param {string} categoryName Category name for which to regenerate the index.
 * @param {array} logFileList  Description
 *
 * @returns {string} The contents of the category index file
 */
export function buildCategoryIndexFile(categoryName, logFileList) {
  // TODO: build header with category name
  // TODO: build list of files in reverse date order
  // TODO: pull the header from the file and use as the link label?
}

export default {};

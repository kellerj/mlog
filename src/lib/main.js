import debug from 'debug';
import fs from 'fs';
import os from 'os';
import path from 'path';

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
  const regex = RegExp(`^${adjustedCategoryName}$`, 'i');
  adjustedCategoryName = getConfig().categories.find(e =>
    regex.test(e));
  // throw an error if a bad category name
  if (!adjustedCategoryName) {
    throw new Error(`Unknown Category: ${categoryName}`);
  }

  return adjustedCategoryName.replace(/ /g, '_');
}

export function importLogEntry(entryText, categoryName, entryDate, overwrite = false) {
  // TODO: confirm that entry text present
  // TODO: if no date given, use the current date
  // TODO: check if the date-named file already exists
  // TODO: if so, append _# to the end of the date
  // TODO: create the file and save the entryText to it
  // TODO: return the path to the new file
}

export default {};

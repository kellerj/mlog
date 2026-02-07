/**
 * @overview Functions related to the main functionality of
 * maintaining the logbook files and strucutre.
 * @module main
 * @author Jonathan Keller
 */
import debug from 'debug';
import fs from 'node:fs';
import path from 'node:path';
import { format, parseISO } from 'date-fns';

import { getConfig } from './config.js';

const LOG = debug('mlog:lib:main');

/**
 * Given an optional date string from the command line, obtain and format the date
 * as specified in the configuration for the logbook.
 *
 * @param  {string} [entryDateString] A string in a parsable date format.
 * @return {string}                   The date reformatted as per the config.
 */
export function getEntryDate(entryDateString) {
  let entryDate;
  if (!entryDateString) {
    entryDate = new Date();
  } else {
    entryDate = parseISO(entryDateString);
  }
  return format(entryDate, getConfig().fileNameFormat);
}

/**
 * Get the category name normalized to that in the configuration file.
 * If an empty name is passed, then return the default category.
 *
 * @param {string} categoryName
 *
 * @returns {string} The normalized category name or default category name.
 */
export function getCategoryName(categoryName) {
  let adjustedCategoryName = categoryName;
  if (!categoryName || !categoryName.trim()) {
    adjustedCategoryName = getConfig().defaultCategory;
  }

  const regex = RegExp(`^${adjustedCategoryName.trim()}$`, 'i');
  adjustedCategoryName = getConfig().categories.find(e => regex.test(e));
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
 * getCategoryPath - Get the filesystem path for a category.
 *
 * @param {string} inputCategoryName
 * @returns {string}
 */
export function getCategoryPath(inputCategoryName) {
  const categoryName = getCategoryName(inputCategoryName);
  const categoryPath = path.join(
    getConfig().mlogLocation,
    convertCategoryNameToFileSystemName(categoryName),
  );
  if (!fs.existsSync(categoryPath)) {
    fs.mkdirSync(categoryPath);
  }
  try {
    fs.accessSync(categoryPath, fs.constants.W_OK | fs.constants.R_OK);
  } catch (_e) {
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
  if (!entryText) {
    throw new Error('No entryText given for the log entry');
  }
  const entryPath = getCategoryPath(categoryName);
  const entryDate = getEntryDate(entryDateString);
  const entryFile = path.format({
    dir: entryPath,
    name: entryDate,
    ext: '.md',
  });
  if (!overwrite && fs.existsSync(entryFile)) {
    throw new Error('Entry for the given date already exists.  Use the --overwrite flag if you want to replace it.');
  }
  LOG('Attempting to write file: %s', entryFile);
  fs.writeFileSync(entryFile, entryText);
  return entryFile;
}

/**
 * if the first line starts with #, parse everything after # and whitespace
 * @param  {string} fileContents Contents of the markdown file for parsing.
 * @param  {string} fileName     Name of the file, used for fallback if the title is not found.
 * @return {string}              The title from the first line of the markdown document.
 */
export function getMarkdownPageTitle(fileContents, fileName) {
  const headerRegexp = /^#+\s*(.+)$/m;
  const title = headerRegexp.exec(fileContents.split('\n')[0]);
  if (title) {
    return title[1].trim();
  }
  return path.basename(fileName, '.md');
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
  let fileContents = `# ${categoryName}\n\n`;
  if (logFileList) {
    logFileList.sort((a, b) => (b.name.localeCompare(a.name)));
    logFileList.forEach((file) => {
      fileContents += `* [${file.title}](${file.name})\n`;
    });
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
  const categoryPath = getCategoryPath(categoryName);
  LOG(`Scanning CategoryPath: ${categoryPath}`);
  const fileNameList = fs.readdirSync(categoryPath);
  LOG(`Found Files: ${fileNameList}`);
  const markdownFileList = fileNameList.filter(file => file.endsWith('.md') && file !== 'index.md');
  const fileList = markdownFileList.map((file) => {
    const fileContents = fs.readFileSync(path.join(categoryPath, file), 'utf8');
    return {
      name: file,
      title: getMarkdownPageTitle(fileContents, file),
    };
  });
  const indexFileName = path.join(categoryPath, 'index.md');
  LOG(`Writing Index File: ${indexFileName}`);
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
  let fileContents = `# ${title}\n\n`;
  if (categoryList) {
    categoryList.sort((a, b) => (a.name.localeCompare(b.name)));
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
  const indexFileName = path.join(getConfig().mlogLocation, 'index.md');
  LOG(`Writing Index File: ${indexFileName}`);
  fs.writeFileSync(indexFileName, buildMainIndexFile(getConfig().title, categoryList));
  return indexFileName;
}

import debug from 'debug';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { getConfig } from './config';

const LOG = debug('lib:main');

function getCategoryPath(categoryName) {
  // TODO: confirm that categoryName present, use default if not given
  // TODO: build the path for the given category
  // TODO: test that it exists and is writable
}

export function importLogEntry(entryText, entryPath, entryDate, overwrite = false) {
  // TODO: confirm that entry text present
  // TODO: if no date given, use the current date
  // TODO: check if the date-named file already exists
  // TODO: if so, append _# to the end of the date
  // TODO: create the file and save the entryText to it
  // TODO: return the path to the new file
}

export default {};

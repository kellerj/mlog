// import parseArgs from 'minimist';
import debug from 'debug';
import commander from 'commander';

const LOG = debug('mlog');

// LOG(parseArgs(process.argv.slice(2)));
commander.version('1.0.0')
  // .option('-c, --category')
  .command('init <directory>', 'Initialize a new repository at the given location.')
  .command('config [options]', 'Set configuration options for the current logbook.')
  .command('server [options]', 'Start up a server to view the logbook in a web browser.')
  .option('-c, --category <categoryName>', 'Category to which to add the given content.')
  .option('-d, --date <YYYY-MM-DD>', 'Date to use for the entry.  Today\'s date will be used if not specified.')
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

if (!commander.runningCommand) {
  LOG('No Child Process Running - Continuing');
} else {
  LOG(`Child Command Specified "${commander.args}" - Skipping Default Actions`);
}

// https://nodejs.org/api/process.html#process_process_stdin
// process.stdin.setEncoding('utf8');
//
// let data = '';
//
// process.stdin.on('readable', () => {
//   const chunk = process.stdin.read();
//   if (chunk !== null) {
//     data += chunk;
//   }
// });
//
// process.stdin.on('end', () => {
//   LOG(data);
// });

// TODO: determine action
// TODO: delegate to module
// TODO: get date to use (--today option?)
// TODO: category to file
// TODO: Regenerate the index for the given category.

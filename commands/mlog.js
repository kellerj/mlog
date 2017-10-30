// import parseArgs from 'minimist';
import debug from 'debug';
import commander from 'commander';

const LOG = debug('mlog');

// LOG(parseArgs(process.argv.slice(2)));
commander.version('1.0.0')
  // .option('-c, --category')
  .command('init [directory]', 'Initialize a new repository at the given location.')
  .parse(process.argv);

LOG(commander.options);
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

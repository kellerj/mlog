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
  .command('add [options]', 'Add an entry to the logbook', { isDefault: true })
  .parse(process.argv);

LOG('*****\nCOMMAND INPUT:\n*****');
LOG(commander);

if (!commander.runningCommand) {
  LOG('No Child Process Running - Continuing');
} else {
  LOG(`Child Command Specified "${commander.args}" - Skipping Default Actions`);
}


// TODO: determine action
// TODO: delegate to module
// TODO: get date to use (--today option?)
// TODO: category to file
// TODO: Regenerate the index for the given category.

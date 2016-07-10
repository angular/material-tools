import {MaterialTools} from './MaterialTools';
import {Logger} from './common/Logger';
import {DefaultConfig} from './common/DefaultConfig';

const yargs = require('yargs');

const DEFAULT_OPTIONS = DefaultConfig.options;
const MAIN_GROUP = 'Arguments:';
const OPTIONAL_GROUP = 'Optional arguments:';
const LOGGING_GROUP = 'Logging arguments:';

// Main arguments
yargs.option('config', {
  alias: 'c',
  describe: 'JSON config file to be loaded. If specified, all other options are ignored.',
  type: 'string',
  requiresArg: true,
  group: MAIN_GROUP
})
.option('destination', {
  alias: ['d', 'dest'],
  describe: 'Target location for the Material build.',
  type: 'string',
  requiresArg: true,
  group: MAIN_GROUP,
  demand: !yargs.argv.config
})
.option('modules', {
  alias: 'm',
  describe: 'List of modules to be included in the build.',
  type: 'array',
  requiresArg: true,
  group: MAIN_GROUP
})
.option('version', {
  alias: 'v',
  describe: 'Angular Material version.',
  default: DEFAULT_OPTIONS.version,
  type: 'string',
  requiresArg: true,
  group: MAIN_GROUP
});

// Optional arguments
yargs.option('main-filename', {
  describe: 'File to be used to figure out the dependencies between modules.',
  default: DEFAULT_OPTIONS.mainFilename,
  requiresArg: true,
  group: OPTIONAL_GROUP
})
.option('destination-filename', {
  describe: 'Base for the output filenames.',
  default: DEFAULT_OPTIONS.destinationFilename,
  requiresArg: true,
  group: OPTIONAL_GROUP
})
.option('cache', {
  describe: 'Directory to be used as a cache for downloaded versions.',
  default: DEFAULT_OPTIONS.cache,
  requiresArg: true,
  group: OPTIONAL_GROUP
});

// Logging arguments
yargs.option('verbose', {
  describe: 'Logs additional info as a build is progressing.',
  group: LOGGING_GROUP
})
.option('silent', {
  describe: 'Will not log any info, including errors and warnings.',
  group: LOGGING_GROUP
});

yargs.strict().help();

let options = yargs.argv;
const tools = new MaterialTools(options.config || options);

tools
  .build()
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

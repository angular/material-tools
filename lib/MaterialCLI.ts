import {MaterialTools, DEFAULTS} from './MaterialTools';

const yargs = require('yargs');
const MAIN_GROUP = 'Arguments:';
const OPTIONAL_GROUP = 'Optional arguments:';

// Main arguments.
yargs.option('config', {
  alias: 'c',
  describe: 'JSON config file to be loaded. If specified, all other options are ignored.',
  type: 'string',
  requiresArg: true,
  group: MAIN_GROUP
});

yargs.option('destination', {
  alias: ['d', 'dest'],
  describe: 'Target location for the Material build.',
  type: 'string',
  requiresArg: true,
  group: MAIN_GROUP,
  demand: !yargs.argv.config
});

yargs.option('modules', {
  alias: 'm',
  describe: 'List of modules to be included in the build.',
  type: 'array',
  requiresArg: true,
  group: MAIN_GROUP
});

yargs.option('version', {
  alias: 'v',
  describe: 'Angular Material version.',
  default: DEFAULTS.version,
  type: 'string',
  requiresArg: true,
  group: MAIN_GROUP
});

// Optional arguments.
yargs.option('cache', {
  describe: 'Directory to be used as a cache for downloaded versions.',
  default: DEFAULTS.cache,
  requiresArg: true,
  group: OPTIONAL_GROUP
});

yargs.option('main-filename', {
  describe: 'File to be used to figure out the dependencies between modules.',
  default: DEFAULTS.mainFilename,
  requiresArg: true,
  group: OPTIONAL_GROUP
});

yargs.option('destination-filename', {
  describe: 'Base for the output filenames.',
  default: DEFAULTS.destinationFilename,
  requiresArg: true,
  group: OPTIONAL_GROUP
});

yargs.strict().help();

let options = yargs.argv;
const tools = new MaterialTools(options.config || options);

tools
  .build()
  .then(data => console.log(`Material-Tools: Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => console.error(error.stack || error));

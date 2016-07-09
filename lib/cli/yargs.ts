import { DEFAULTS } from './options';

export let yargs = require('yargs');

const MAIN_GROUP = 'Arguments:';
const OPTIONAL_GROUP = 'Optional arguments:';
const LOGGING_GROUP = 'Logging arguments:';

yargs
  .option('config', {
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
    // TODO: reintroduce as required options. Not possible yet, because of chained option registrations.
    // demand: !yargs.argv.config
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
    default: DEFAULTS.version,
    type: 'string',
    requiresArg: true,
    group: MAIN_GROUP
  })
  .option('main-filename', {
    describe: 'File to be used to figure out the dependencies between modules.',
    default: DEFAULTS.mainFilename,
    requiresArg: true,
    group: OPTIONAL_GROUP
  })
  .option('destination-filename', {
    describe: 'Base for the output filenames.',
    default: DEFAULTS.destinationFilename,
    requiresArg: true,
    group: OPTIONAL_GROUP
  })
  .option('cache', {
    describe: 'Directory to be used as a cache for downloaded versions.',
    default: DEFAULTS.cache,
    requiresArg: true,
    group: OPTIONAL_GROUP
  })
  .option('verbose', {
    describe: 'Logs additional info as a build is progressing.',
    group: LOGGING_GROUP
  })
  .option('silent', {
    describe: 'Will not log any info, including errors and warnings.',
    group: LOGGING_GROUP
  });

yargs.strict().help();


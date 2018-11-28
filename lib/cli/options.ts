import {DefaultConfig} from '../common/DefaultConfig';

const merge = require('merge');

const DEFAULT_OPTIONS = DefaultConfig.options;
const MAIN_GROUP = 'Arguments:';
const OPTIONAL_GROUP = 'Optional arguments:';
const LOGGING_GROUP = 'Logging arguments:';

function addDefaults(option: any): any {
  return merge({
    type: 'string',
    requiresArg: true,
    group: MAIN_GROUP,
    global: true
  }, option);
}

export function registerOptions(yargs: any): any {
  // Main arguments
  yargs.option('config', addDefaults({
    alias: 'c',
    describe: 'JSON config file to be loaded. If specified, all other options are ignored.'
  }))
  .option('destination', addDefaults({
    alias: ['d', 'dest'],
    describe: 'Target location for the Material build.',
    demand: !yargs.argv.config
  }))
  .option('modules', addDefaults({
    alias: 'm',
    describe: 'List of modules to be included in the build.',
    type: 'array'
  }))
  .option('version', addDefaults({
    alias: 'v',
    describe: 'AngularJS Material version.',
    default: DEFAULT_OPTIONS.version
  }));

  // Optional arguments
  yargs.option('main-filename', addDefaults({
    describe: 'File to be used to figure out the dependencies between modules.',
    default: DEFAULT_OPTIONS.mainFilename,
    group: OPTIONAL_GROUP
  }))
  .option('destination-filename', addDefaults({
    describe: 'Base for the output filenames.',
    default: DEFAULT_OPTIONS.destinationFilename,
    group: OPTIONAL_GROUP
  }))
  .option('cache', addDefaults({
    describe: 'Directory to be used as a cache for downloaded versions.',
    default: DEFAULT_OPTIONS.cache,
    group: OPTIONAL_GROUP
  }));

  // Logging arguments
  yargs.option('verbose', {
    describe: 'Logs additional info as a build is progressing.',
    group: LOGGING_GROUP
  })
  .option('silent', {
    describe: 'Will not log any info, including errors and warnings.',
    group: LOGGING_GROUP
  });

  return yargs;
}

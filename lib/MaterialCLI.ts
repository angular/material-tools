import {MaterialTools} from './MaterialTools';
import {Logger} from './common/Logger';
import {registerOptions} from './cli/options';
import {registerCommands} from './cli/commands';

const yargs = require('yargs');

registerOptions(yargs)
  .strict()
  .help();

// Sub-commands have to be registered after all the global arguments.
registerCommands(yargs);

let options = yargs.argv;

new MaterialTools(options.config || options)
  .build(options._[0])
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

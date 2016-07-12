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
let command = options._[0];
let tools = new MaterialTools(options.config || options);
let commandMap = {
  css: tools.buildCSS,
  js: tools.buildJS,
  theme: tools.buildTheme
};

(commandMap[command] || tools.build)
  .call(tools)
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

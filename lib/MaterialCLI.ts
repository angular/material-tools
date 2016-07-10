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

if (command === 'theme') {
  options.theme = {
    primaryPalette: options.primaryPalette,
    accentPalette: options.accentPalette,
    warnPalette: options.warnPalette,
    backgroundPalette: options.backgroundPalette,
    dark: !!options.dark
  };
}

const tools = new MaterialTools(options.config || options);
let promise = null;

switch (command) {
  case 'css':
    promise = tools.buildCSS();
    break;

  case 'js':
    promise = tools.buildJS();
    break;

  case 'theme':
    promise = tools.buildTheme();
    break;

  default:
    promise = tools.build();
    break;
}
promise
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

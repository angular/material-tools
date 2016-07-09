import {yargs} from './cli/yargs';
import {MaterialTools} from './MaterialTools';
import {Logger} from './common/Logger';

const options = yargs.argv;
const tools = new MaterialTools(options.config || options);

tools
  .build()
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

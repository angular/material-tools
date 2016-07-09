import {yargs} from './yargs';
import {MaterialTools} from '../tools/material';

  let options = yargs.argv;
  let tools = new MaterialTools( options.config || options );

export default tools;

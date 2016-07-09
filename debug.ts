let merge = require('merge');
import { Logger } from './lib/utils/logger';
import {MaterialTools} from './lib/tools/material';

let tools = new MaterialTools();
    tools.options = merge( tools.options, {
      destination: './tmp',
      version: '1.1.0-rc.5',
      modules: ['list', 'datepicker'],
      theme: {
        primaryPalette: 'indigo',
        accentPalette: 'purple',
        warnPalette: 'deep-orange',
        backgroundPalette: 'grey'
      }
    });

tools
  .build( )
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

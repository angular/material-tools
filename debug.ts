import {MaterialTools} from './lib/MaterialTools';
import {Logger} from './lib/common/Logger';

let tools = new MaterialTools({
  destination: './tmp',
  version: '1.1.0-rc.5',
  modules: ['list', 'datepicker'],
  theme: {
    primaryPalette: 'indigo',
    accentPalette: 'purple'
  }
});

tools
  .build()
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

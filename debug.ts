import {MaterialTools} from './lib/MaterialTools';
import {Utils} from './lib/Utils';

let tools = new MaterialTools({
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
  .build()
  .then(data => Utils.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Utils.error(error.stack || error));
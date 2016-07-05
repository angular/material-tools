import {MaterialTools} from './lib/MaterialTools';

let tools = new MaterialTools({
  destination: './tmp',
  version: '1.1.0-rc.5',
  modules: ['checkbox', 'datepicker'],
  theme: {
    primaryPalette: 'indigo',
    accentPalette: 'purple',
    warnPalette: 'deep-orange',
    backgroundPalette: 'grey'
  }
});

tools
  .build()
  .then(data => console.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => console.error(error.stack || error));

import {MaterialTools} from './lib/MaterialTools';
import {Logger} from './lib/common/Logger';

let tools = new MaterialTools({
  destination: './tmp',
  version: '1.1.1',
  modules: ['button', 'list', 'datepicker'],
  theme: {
    primaryPalette: 'darkerRed',
    accentPalette: 'purple'
  },
  palettes: {
    darkerRed: {
      extends: 'red',
      50: 'FBE9E7',
      100: 'FFCCBC',
      200: 'FFAB91',
      300: 'FF8A65',
      contrastDefaultColor: 'dark'
    }
  }
});

tools
  .build()
  .then(data => Logger.log(`Successfully built ${data.dependencies._flat.join(', ')}.`))
  .catch(error => Logger.error(error.stack || error));

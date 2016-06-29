import {MaterialTools} from './lib/MaterialTools';

let tools = new MaterialTools({
  version: '1.1.0-rc.5',
  modules: ['datepicker'],
  theme: {
    primaryPalette: 'indigo',
    accentPalette: 'purple',
    warnPalette: 'deep-orange',
    backgroundPalette: 'grey'
  }
});

/** Retrieve the basic build files for the modules */
tools
  .getFiles()
  .then(files => {
    require('fs').writeFileSync('theme-static.css', tools.buildStaticTheme(files));
  })
  .catch(error => console.error(error));
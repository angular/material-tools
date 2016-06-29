import {MaterialTools} from './lib/MaterialTools';

import * as fs from 'fs';

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
  ._getData()
  .then(data => {
    let js = tools.buildJS(data, 'angular-material.min.js.map');

    fs.writeFileSync('angular-material.js', js.source);
    fs.writeFileSync('angular-material.min.js', js.compressed);
    fs.writeFileSync('angular-material.min.js.map', js.map);
    fs.writeFileSync('theme-static.css', tools.buildStaticTheme(data.files));
  })
  .catch(error => console.error(error));

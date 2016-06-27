import {MaterialTools} from './lib/MaterialTools';

new MaterialTools({
  version: '1.1.0-rc.5',
  modules: ['datepicker']
})
.getFiles()
.then(files => console.log(files))
.catch(error => console.error(error));

/** Test Environment **/
import {ThemingBuilder} from './lib/theming/ThemingBuilder';

let themeBuilder = new ThemingBuilder({
  primaryPalette: 'red',
  accentPalette: 'blue',
  warnPalette: 'orange',
  backgroundPalette: 'grey'
});


let themeCSS = themeBuilder.build();
// -- console.log(themeCSS);

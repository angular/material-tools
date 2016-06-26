import {MaterialTools} from './lib/MaterialTools';

new MaterialTools({
  version: '1.1.0-rc.5',
  modules: ['datepicker']
})
.getFiles()
.then(files => console.log(files));

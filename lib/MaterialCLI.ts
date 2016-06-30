// #! /usr/bin/env node

import {MaterialTools} from './MaterialTools';

let options = require('commander');

options
  .option('-v, --version [version]', 'Angular Material version.')
  .option('-d, --destination [path]', 'Target location for the Material build.')
  .option('-m, --modules <list>', 'Comma-separated list of modules to be included in the build.', list => list.split(','))
  .option('--cache [directory]', 'Directory to be used as a cache for downloaded versions.')
  .option('--main-filename [name]', 'File to be used to figure out the dependencies between modules.')
  .option('--destination-filename [name]', 'Base for the output filenames.')
  .parse(process.argv);

// `commander` has a `version` method on it's prototype. This means that if no `version`
// is specified, it would get looked up the prototype chain. In this case we define
// an own, undefined `version` property so the MaterialTools can properly fall back
// to the default.
if (!options.hasOwnProperty('version')) {
  Object.defineProperty(options, 'version', {
    writable: true
  });
}

const tools = new MaterialTools(options);

tools.build().catch(error => console.error(error));

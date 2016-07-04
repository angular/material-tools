// #! /usr/bin/env node
import {MaterialTools} from './MaterialTools';

const yargs = require('yargs').options({
  destination: {
    alias: ['d', 'dest'],
    describe: 'Target location for the Material build.'
  },
  config: {
    alias: 'c',
    describe: 'JSON config file to be loaded.',
  },
  vesion: {
    alias: 'v',
    describe: 'Angular Material version.'
  },
  modules: {
    alias: 'm',
    describe: 'List of modules to be included in the build.',
    array: true
  },
  cache: {
    describe: 'Directory to be used as a cache for downloaded versions.'
  },
  mainFilename: {
    describe: 'File to be used to figure out the dependencies between modules.'
  },
  destinationFilename: {
    describe: 'Base for the output filenames.'
  }
}).help().strict();

let options = yargs.argv;
const tools = new MaterialTools(options.config || options);

tools.build().catch(error => console.error(error));

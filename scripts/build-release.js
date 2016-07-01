'use strict';

const exec = require('child_process').execSync;
const glob = require('glob').sync;
const fse = require('fs-extra');

// We run the Typescript Compiler from the node modules because we want to be consistent
// with the compiler version.
const TSC_BIN = './node_modules/typescript/bin/tsc';

// Create the distribution folder if it doesn't exist.
fse.mkdirpSync(`${__dirname}/../dist`);

// Copy all current source files over to the distribution folder.
fse.copySync(`${__dirname}/../lib/`,  `${__dirname}/../dist`);

// Retrieve all source files.
let sourceFiles = glob(`${__dirname}/../lib/**/*.ts`);

try {
  exec(`node ${TSC_BIN} --declaration ${sourceFiles.join(' ') } ./typings/index.d.ts --outDir ./dist`, {
    cwd: `${__dirname}/..`
  });

  console.log("Build: Successfully compiled the TypeScript files into ES5.");
} catch (e) {
  console.error("Error: An error occurred while compiling the TypeScript files into ES5.");
  throw e;
}
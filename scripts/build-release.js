'use strict';

const exec = require('child_process').execSync;
const glob = require('glob').sync;
const fse = require('fs-extra');

// We run the Typescript Compiler from the node modules because we want to be consistent
// with the compiler version.
const TSC_BIN = './node_modules/typescript/bin/tsc';
const projectRoot = `${__dirname}/../`;
const dist = `${projectRoot}dist/`;

// Copy all current source files over to the distribution folder.
fse.copySync(projectRoot + 'lib',  dist + 'lib');

// Copy the package.json file to the distribution folder, so we can easily deploy the NPM module.
fse.copySync(projectRoot + 'package.json', dist + 'package.json');

// Copy the bin directory in order to be able to run the CLI.
fse.copySync(projectRoot + 'bin/material-tools', dist + 'bin/material-tools');

// Retrieve all source files.
let sourceFiles = glob(projectRoot + 'lib/**/*.ts');

try {
  exec(`node ${TSC_BIN} --declaration ${sourceFiles.join(' ') } ./typings/index.d.ts --outDir ${dist}lib`, {
    cwd: projectRoot
  });

  console.log("Build: Successfully compiled the TypeScript files into ES5.");
} catch (e) {
  console.error("Error: An error occurred while compiling the TypeScript files into ES5.");
  throw e;
}

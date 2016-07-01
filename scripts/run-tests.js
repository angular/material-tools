'use strict';

// Allow Jasmine Core to load typescript files.
require('ts-node/register');

const path = require('path');
const glob = require('glob');
const Jasmine = require('jasmine');

// Create our jasmine instance.
let test = new Jasmine({
  projectBaseDir: path.resolve(`${__dirname}/..`),
});

let specFiles = glob.sync(`${__dirname}/../tests/**/*.spec.ts`);

specFiles = specFiles.map(file => path.relative(test.projectBaseDir, file));

test.execute(specFiles);

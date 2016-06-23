// Allow Jasmine Core to load typescript files.
require('ts-node/register');

var path = require('path');
var glob = require('glob');
var Jasmine = require('jasmine');

// Create our jasmine instance.
var test = new Jasmine({
  projectBaseDir: path.resolve(`${__dirname}/..`),
});

var specFiles = glob.sync(`${__dirname}/../tests/**/*.spec.ts`);

specFiles = specFiles.map(file => path.relative(test.projectBaseDir, file));

test.execute(specFiles);

'use strict';

require('ts-node/register');

// Enable verbose logging by adding the "--verbose" command line argument to the current
// process.
process.argv.push('--verbose');

const request = require('request');
const MaterialTools = require('../lib/MaterialTools').MaterialTools;
const extractVersionNumber = require('../lib/common/Utils').Utils.extractVersionNumber;
const Logger = require('../lib/common/Logger').Logger;

const SUPPORTED_VERSION = extractVersionNumber('1.1.20');

request('http://material.angularjs.org/docs.json', (error, response, body) => {
  if (!error && response.statusCode === 200) {
    let versions = JSON.parse(body)['versions'];

    versions = versions
      .filter(entry => extractVersionNumber(entry) >= SUPPORTED_VERSION);

    onVersionsRetrieved(versions);
  }
});

async function onVersionsRetrieved(versions) {
  Logger.log(`Retrieved versions from AngularJS Material docs (${versions.length}x)`);

  for (let version of versions) {
    await runVersion(version);
  }

  Logger.log("Successfully tested the tool against all supported versions.");
  process.exit(0);
}

function runVersion(version) {
  let tools = new MaterialTools({
    modules: ['list'],
    destination: `./tmp/${version}`,
    version: version,
    theme: {
      primaryPalette: 'indigo',
      accentPalette: 'purple',
      warnPalette: 'deep-orange',
      backgroundPalette: 'grey'
    }
  });

  return tools.build()
    .then(() => Logger.log(`Successfully built ${version}.`))
    .catch(error => {
      Logger.error(`Test: An error occurred while building ${version}`);
      Logger.error(error.stack || error);
      process.exit(1);
    });
}

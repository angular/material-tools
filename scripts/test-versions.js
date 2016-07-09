'use strict';

// Allow Jasmine Core to load typescript files.
require('ts-node/register');

const request = require('request');
const PackageResolver = require('../lib/resolvers/packages').PackageResolver;
const MaterialTools = require('../lib/MaterialTools').MaterialTools;
const _getVersionNumber = PackageResolver._getVersionNumber.bind(PackageResolver);

const SUPPORTED_VERSION = _getVersionNumber('1.0.0');

request('http://material.angularjs.org/docs.json', (error, response, body) => {
  if (!error && response.statusCode == 200) {
    let versions = JSON.parse(body)['versions'];

    versions = versions
      .filter(entry => _getVersionNumber(entry) >= SUPPORTED_VERSION);

    onVersionsRetrieved(versions);
  }
});

function onVersionsRetrieved(versions) {

  let versionTasks = versions.map(version => runVersion(version));

  Promise.all(versionTasks).then(() => {
    console.log("Test: Successfully tested the tool against all supported versions.");
    process.exit(0);
  });
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
    .then(() => {
      console.log(`Test: Successfully built ${version}`);
    })
    .catch(error => {
      console.error(`Test: An error occurred while building ${version}`);
      console.error(error.stack || error);
      process.exit(1);
    });
}

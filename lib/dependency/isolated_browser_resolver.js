// Load Angular from the Node Modules
require('angular');

/** Dependency Map, which will be exported */
let dependencyMap = {};

/** ngMaterial Component Module prefix */
const modulePrefix = 'material.';

/** Reference to the loaded Angular global */
let angular = window.angular;

// Replace all of Angular's methods with empty functions.
Object
  .keys(angular)
  .forEach(function(key) {
  if (typeof angular[key] === 'function') {
    angular[key] = function() {};
  }
});

// Overwrite Angular's module function to be able to intercept
// the dependency / module registration.
angular.module = (name, dependencies) => {
  if (dependencies && name.indexOf(modulePrefix) !== -1) {

    // Filter out all the non-material dependencies and map them to
    // an array with their clean names.
    dependencyMap[cleanupModuleName(name)] = dependencies
      .filter(item => item.indexOf(modulePrefix) !== -1)
      .map(cleanupModuleName);

  }

  // By default Angular returns itself again after the module call.
  return new AngularModuleMock();
};

/**
 * Angular Material module names are always separated with the dot delimiter.
 * To retrieve the plain module name, we just return the string after the last dot.
 */
function cleanupModuleName(name) {
  return name.substring(name.lastIndexOf('.') + 1);
}

/**
 * Creates a mocked object of the Angular Module instance.
 */
function AngularModuleMock() {
  let self = this;
  let instanceFunctions = [
    'run', 'config', 'directive', 'service', 'provider', 'filter', 'factory',
    'constant', 'controller', 'animation', 'component'
  ];

  instanceFunctions.forEach(fnName => {
    self[fnName] = () => this;
  });
}

// Load Angular Material after the Angular functions have been mocked.
require('angular-material');

// Export the registered dependency map.
module.exports = dependencyMap;

// Load Angular from the Node Modules
require('angular');

function noop() {}

// Replace all of Angular's methods with noops.
Object.keys(window.angular).forEach(function(key) {
  if (typeof window.angular[key] === 'function') {
    window.angular[key] = noop;
  }
});

var dependencyMap = {};

// Monkey patch the module definitions in order
// to intercept the dependencies.
window.angular.module = function(name, dependencies) {
  var prefix = 'material.';

  if (dependencies && name.indexOf(prefix) === 0) {
    // Filter out all the non-material dependencies and map them to
    // an array with their clean names.
    dependencyMap[cleanupModuleName(name)] = dependencies.filter(function(current){
      return current.indexOf(prefix) === 0;
    }).map(cleanupModuleName);
  }

  return new DummyModule();
};

function cleanupModuleName(name) {
  return name.substring(name.lastIndexOf('.') + 1);
}

function DummyModule() {
  var self = this;
  [
    'run', 'config', 'directive', 'service', 'provider', 'filter', 'factory',
    'constant', 'controller', 'animation', 'component'
  ].forEach(function(current) {
    self[current] = function() {
      return this;
    };
  });
}

// Load Angular Material
require('angular-material');

// Export the registered dependency map.
module.exports = dependencyMap;

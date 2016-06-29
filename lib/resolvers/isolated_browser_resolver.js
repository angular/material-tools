// Load Angular from the Node Modules
require('angular');

/** Dependency Map, which will be exported */
let dependencyMap = {};

/** Injector Map, which holds all injectable values from Angular */
let injectorMap = {};

/** Main ngMaterial  */
let mainModule = { rawName: window.$$mainModule || 'ngMaterial' };

/** ngMaterial Component Module prefix */
const modulePrefix = 'material.';

/** Reference to the loaded Angular global */
let angular = window.angular;

// Overwrite the jqLite element function of Angular to prevent errors with missing DOM globals.
angular.element = function() {};

// Overwrite Angular's module function to be able to intercept
// the dependency / module registration.
angular.module = (name, dependencies) => {
  if (dependencies && name.indexOf(modulePrefix) !== -1) {

    // Filter out all the non-material dependencies and map them to
    // an array with their clean names.
    dependencyMap[cleanupModuleName(name)] = {
      rawName: name,
      dependencies: dependencies
      .filter(item => item.indexOf(modulePrefix) !== -1)
      .map(cleanupModuleName)
    };

  } else if (name === mainModule.rawName) {
    // Filter out all the Material dependencies. Only the relevant ones will be added later.
    mainModule.dependencies = dependencies.filter(item => item.indexOf(modulePrefix) === -1);
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
   'config', 'run'
  ];

  let injectorFunctions = [
    'directive', 'service', 'filter', 'factory', 'provider',
    'constant', 'controller', 'animation', 'component'
  ];

  instanceFunctions.forEach(fnName => {
    self[fnName] = () => this;
  });

  injectorFunctions.forEach(fnName => {
    self[fnName] = (key, value) => {
      injectorMap[key] = value;
      return this;
    }
  });

  // It is possible to add some interception functions to the injector / instance functions.
  if (window.$$interception) {
    Object.keys(window.$$interception).forEach(fnName => {
      this[fnName] = function() {

        if (injectorFunctions.indexOf(fnName) !== -1) {
          injectorMap[arguments[0]] = arguments[1];
        }

        return window.$$interception[fnName].apply(this, arguments) || this;
      }
    });
  }
}

// Load Angular Material file after the Angular functions have been mocked.
require(window.$$moduleName || 'angular-material');

// Export the validated data from ngMaterial.
module.exports = {
  dependencies: dependencyMap,
  mainModule: mainModule,
  injector: injectorMap
};

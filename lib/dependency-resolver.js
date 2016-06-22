function DependencyResolver() {

}

/**
 * Figures out the dependencies of the specified modules.
 * @param  {Array} modules Modules whose dependencies need to be figured out.
 * @return {Object} Map of the dependencies between the modules.
 */
DependencyResolver.prototype.resolve = function(modules) {
  // Shim the window and load Angular.
  var map = this.getMap();
  var output = {};

  if (modules) {
    // Maps all the dependencies.
    modules.forEach(function addModule(name) {
      if (!output[name] && map[name]) {
        var deps = output[name] = map[name];

        if (deps.length) {
          deps.forEach(addModule);
        }
      }
    });
  } else {
    output = map;
  }

  // Flattens the object into an array for convenience.
  output._flat = Object.keys(output);
  return output;
};

/**
 * Shims the global `window` and `angular` variables, loads Angular and
 * intecepts all Material module definitions.
 * @return {Object} Map of all the module dependencies.
 */
DependencyResolver.prototype.getMap = function() {
  if (this.map) return this.map;

  // Saves the global variables before we start, in case they were defined,
  // as well as the state of Node's `require` cache.
  var prevWindow = GLOBAL.window;
  var prevAngular = GLOBAL.angular;
  var cacheBefore = Object.keys(require.cache);
  var map = this.map = {};

  var noop = function(){
    return dummyDomNode;
  };

  var dummyDomNode = {
    setAttribute: noop,
    pathname: '',
    getAttribute: function() {
      return '';
    }
  };

  var obj = {
    addEventListener: noop,
    querySelector: noop,
    createElement: noop,
    prototype: {
      contains: noop
    }
  };

  GLOBAL.window = {
    addEventListener: noop,
    document: obj,
    Node: obj,
    location: obj
  };

  GLOBAL.angular = window.angular;

  require('angular');

  // Replace all of Angular's methods with noops.
  Object.keys(window.angular).forEach(function(key) {
    if (typeof window.angular[key] === 'function') {
      window.angular[key] = noop;
    }
  });

  // Monkey patch the module definitions in order
  // to intercept the dependencies.
  window.angular.module = function(name, dependencies) {
    var dummy = {};
    var prefix = 'material.';

    if (dependencies && name.indexOf(prefix) === 0) {
      // Filter out all the non-material dependencies and map them to
      // an array with their clean names.
      var cleanDeps = dependencies.filter(function(current){
        return current.indexOf(prefix) === 0;
      }).map(cleanupModuleName);

      map[cleanupModuleName(name)] = cleanDeps;
    }

    return new DummyModule();
  };

  // Load Material in order to register the dependencies.
  require('angular-material');

  // Either restore or remove the global angular variable.
  if (prevAngular) {
    GLOBAL.angular = prevAngular;
  } else {
    delete GLOBAL.angular;
  }

  // Either restore or remove the global window variable.
  if (prevWindow) {
    GLOBAL.window = prevWindow;
  } else {
    delete GLOBAL.window;
  }

  // Clear any modules that were loaded in
  // this file from the `require` cache.
  Object.keys(require.cache).forEach(function(key) {
    if (cacheBefore.indexOf(key) === -1) {
      delete require.cache[key];
    }
  });

  return this.map;
};

/**
 * Removes the prefixes from a module name.
 * (e.g. "material.components.tooltip" turns into "tooltip")
 * @param  {String} name Raw module name.
 * @return {String} Parsed module name.
 */
function cleanupModuleName(name) {
  return name.substring(name.lastIndexOf('.') + 1);
}

/**
 * Creates an object with the same methods as an Angular module.
 */
function DummyModule() {
  var self = this;

  [
    'run', 'config', 'directive', 'service',
    'provider', 'filter', 'factory', 'constant',
    'controller', 'animation', 'component'
  ].forEach(function(current) {
    self[current] = function() {
      return this;
    };
  });
}

module.exports = DependencyResolver;

var mockWindow = require('./mock-window');

/**
 * Figures out the dependencies of the specified modules.
 * @param  {Array} modules Modules whose dependencies need to be figured out.
 * @return {Object} Map of the dependencies between the modules.
 */
module.exports = function getDependencies(modules) {
    // Shim the window and load Angular.
    var cleanupWindow = mockWindow();
    var output = {};
    var map = {};

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

        // Monkey patch all the module methods so they don't throw.
        [
            'run', 'config', 'directive', 'service',
            'provider', 'filter', 'factory', 'constant',
            'controller', 'animation'
        ].forEach(function(current) {
            dummy[current] = function() {
                return this;
            };
        });

        return dummy;
    };

    // Load Material in order to register the dependencies.
    require('angular-material');

    // Tear down the patches and global variables.
    cleanupWindow();

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

    // Flatten the object into an array for convenience.
    output._flat = Object.keys(output);
    return output;
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

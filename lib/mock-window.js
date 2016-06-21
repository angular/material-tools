/**
 * Shims the global `window` and `angular` variables and loads Angular.
 * @return {Function} Cleans up the shims and global variables.
 */
module.exports = function mockWindow() {
    // Saves the global variables before we start, in case they were defined,
    // as well as the state of Node's `require` cache.
    var prevWindow = GLOBAL.window;
    var prevAngular = GLOBAL.angular;
    var cacheBefore = Object.keys(require.cache);
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

    return function cleanup() {
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
    };
};

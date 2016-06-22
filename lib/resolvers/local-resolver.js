var path = require('path');

function LocalResolver() {}

/**
 * Looks up for the local installed Angular Material version in the node modules.
 * @returns {String} Path of the local Angular Material version.
 */
LocalResolver.prototype.resolve = function() {
  try {
    var entryFile = require.resolve("angular-material");
    return path.dirname(entryFile);
  } catch(e) {
    console.error(e);
  }
};

module.exports = new LocalResolver();


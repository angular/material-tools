/**
 * This is a basic Node file, which is used to confirm that the file will be executed
 * inside of a new Virtual Machine
 */

var result = require('./fake-virtual-context-exports.js');

module.exports = {
  module: module,
  require: require,
  __filename: __filename,
  __dirname: __dirname,

  // Custom developer exported variables
  numbers: result
};
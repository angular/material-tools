/**
 * Registers some fake modules to be able to test the dependency resolution
 */

angular.module('ngMaterial', ['material.components.list', 'material.components.autocomplete']);

angular.module('material.core', ['material.theming']);
angular.module('material.components.list', ['material.core']);
angular.module('material.components.autocomplete', ['material.core']);
angular.module('material.theming', []);

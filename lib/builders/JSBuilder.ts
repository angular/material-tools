import {MaterialToolsOutput, MaterialToolsData} from '../common/Interfaces';

const fse = require('fs-extra');
const uglify = require('uglify-js');

export class JSBuilder {
  /**
   * Generates the minified and non-minified JS, as well as a source map, based on the options.
   */
  static build(data: MaterialToolsData, filename: string): MaterialToolsOutput {
    let mainModule = this._buildMainModule(data.dependencies._mainModule);
    let raw = data.files.js.map(path => fse.readFileSync(path).toString()).join('\n');
    let source = [mainModule, '', raw].join('\n');
    let compressed = uglify.minify(source, {
      fromString: true,
      outSourceMap: filename
    });

    return {
      source: source,
      compressed: compressed.code,
      map: compressed.map
    }
  }

  /**
   * Builds a javascript snippet, which registers a new Angular Module with
   * the required dependencies.
   */
  private static _buildMainModule(mainModule: { rawName: string, dependencies: string[] }): string {
    let dependencyString = mainModule.dependencies.map(name => `'${name}'`).join(', ');

    return [
      '(function() {',
      '  "use strict";',
      `  angular.module('${mainModule.rawName}', [${dependencyString}]);`,
      '})();'
    ].join('\n');
  }
}

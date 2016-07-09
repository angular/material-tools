import {MaterialToolsData, MaterialToolsFile} from '../tools/interfaces/files';

const fse = require('fs-extra');
const uglify = require('uglify-js');

export class JSBuilder {
  /**
   * Generates the minified and non-minified JS, as well as a source map, based on the options.
   */
  static build(data: MaterialToolsData, filename: string): MaterialToolsFile {
    let mainModule = this.getMainModule(data.dependencies._mainModule);
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
   * Generates the main module string, containing all the dependencies.
   * @param {string[] }} mainModule [description]
   */
  private static getMainModule(mainModule: { rawName: string, dependencies: string[] }): string {
    let dependencyString = mainModule.dependencies.map(name => `'${name}'`).join(', ');

    return [
      '(function() {',
      '  "use strict";',
      `  angular.module('${mainModule.rawName}', [${dependencyString}]);`,
      '})();'
    ].join('\n');
  }
}

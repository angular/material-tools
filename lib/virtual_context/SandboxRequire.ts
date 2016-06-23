import * as fs from 'fs';
import * as vm from 'vm';
import * as path from 'path';

let NodeModule = require('module');

/**
 * Global cache for all required modules with the associated module exports
 */
export let EXPORTS_CACHE = {};

/**
 * Creates a require function, which runs the required files inside of a new Virtual Machine,
 * which supports the Node Environment inside of the new VM, without accessing the main VM.
 * @param filePath File path of the current used module
 * @param globals Globals which will be applied to the context
 * @returns {Function(<String>)}
 */
export function createSandboxRequire(filePath, globals?) {

  let _parentModule = new NodeModule(filePath);
  _parentModule.filename = filePath;
  _parentModule.paths = NodeModule._nodeModulePaths(path.dirname(filePath));

  function SandboxRequire(file) {
    let fileName = resolve(file);

    if (EXPORTS_CACHE[fileName]) {
      return EXPORTS_CACHE[fileName];
    }

    let fileSource = fs.readFileSync(fileName, 'utf8');

    let currentModule = new NodeModule(fileName, _parentModule);
    currentModule.filename = fileName;

    let locals = getLocals(currentModule, createSandboxRequire(fileName, globals));

    fileSource =
      `(function(global, ${ Object.keys(locals).join(', ') }) {
        ${fileSource}
      });`;

    // Adds the default Node global variables to the custom globals, specified by the developer.
    updateGlobals();

    // Runs the loaded file source inside of a new context with the given globals.
    let runFn = vm.runInNewContext(fileSource, globals, fileName);

    let _localValues = [];
    for (let key in locals) {
      if (locals.hasOwnProperty(key)) {
        _localValues.push(locals[key]);
      }
    }

    // Run our Function inside of the new context.
    runFn.apply(currentModule.exports, [globals].concat(_localValues));

    // Cache the new exports
    EXPORTS_CACHE[fileName] = currentModule.exports;

    return currentModule.exports;
  }

  function updateGlobals() {
    for (let globalKey in global) {
      if (!globals.hasOwnProperty(globalKey)) {
        globals[globalKey] = global[globalKey];
      }
    }
  }

  function getLocals(module: NodeModule, requireFn: Function): any {
    return {
      __filename: module.filename,
      __dirname: path.dirname(module.filename),
      module: module,
      exports: module.exports,
      require: requireFn
    };
  }

  function resolve(moduleName) {
    let resolved = NodeModule._resolveFilename(moduleName, _parentModule);
    return (resolved instanceof Array) ? resolved[1] : resolved;
  }

  SandboxRequire['resolve'] = resolve;

  return SandboxRequire;

}

/**
 * Overwrites the cache object for all Sandbox require calls.
 * @param cache Cache Object for the Sandbox Require
 */
export function setSandboxRequireCache(cache: any) {
  EXPORTS_CACHE = cache;
}

import * as fs from 'fs';
import * as vm from 'vm';
import * as path from 'path';
import { forEach } from '../utils/lodash';

const NodeModule = require('module');
const merge = require('merge');

/** Default Options for the Sandbox Require */
const DEFAULT_OPTIONS: SandboxRequireOptions = {
  caching: true,
  strictMode: false
};

/**
 * Creates a require function, which runs the required files inside of a new Virtual Machine,
 * which supports the Node Environment inside of the new VM, without accessing the main VM.
 * @param filePath File path of the current used module
 * @param globals Globals which will be applied to the context
 * @param options Options for the Sandboxed Require
 * @param EXPORTS_CACHE Cache Object for the sandboxed require.
 * @returns {Function(<String>)}
 */
export function createSandboxRequire(filePath, globals?, options?: SandboxRequireOptions, EXPORTS_CACHE = {}) {

  options = merge({}, DEFAULT_OPTIONS, options || {});

  let _parentModule = new NodeModule(filePath);
  _parentModule.filename = filePath;
  _parentModule.paths = NodeModule._nodeModulePaths(path.dirname(filePath));

  function SandboxRequire(file: string): any {
    let fileName = resolve(file);

    if (EXPORTS_CACHE[fileName] && options.caching) {
      return EXPORTS_CACHE[fileName];
    }

    let fileSource = fs.readFileSync(fileName, 'utf8');

    let currentModule = new NodeModule(fileName, _parentModule);
    currentModule.filename = fileName;

    let childSandboxRequire = createSandboxRequire(fileName, globals, options, EXPORTS_CACHE);

    let locals = getLocals(currentModule, childSandboxRequire);

    fileSource =
      `(function(global, ${ Object.keys(locals).join(', ') }) {
        ${options.strictMode ? '"use strict";' : ''}
        ${fileSource}
      });`;

    // Adds the default Node global variables to the custom globals, specified by the developer.
    updateGlobals();

    // Runs the loaded file source inside of a new context with the given globals.
    let runFn = vm.runInNewContext(fileSource, globals, fileName);

    let _localValues = [];
    // Iterate through all locals and push the retrieved values to the value array.
    forEach(locals, (value, key) => _localValues.push(value));

    // Run our Function inside of the new context.
    runFn.apply(currentModule.exports, [globals].concat(_localValues));

    if (options.caching) {
      EXPORTS_CACHE[fileName] = currentModule.exports;
    }

    return currentModule.exports;
  }

  function updateGlobals() {
    // Moves the default Node globals into the current fake global object.
    forEach(global, (value, key) => globals[key] = value);
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

  return <SandboxRequireFunction> SandboxRequire;

}

/** Definition for the Sandbox Require Function */
export interface SandboxRequireFunction {
  (file: string): any;
  resolve: (moduleName) => string;
}

/** Options for the Sandbox Require Generation */
export interface SandboxRequireOptions {
  /** Whether required files should run in Strict Mode */
  strictMode?: boolean;

  /** Whether the created require function should cache the exports */
  caching?: boolean
}

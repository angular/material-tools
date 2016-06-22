import * as fs from 'fs';
import * as vm from 'vm';
import * as path from 'path';

var NodeModule = require('module');

var cache = {};

export function createSandboxRequire(filePath, globals?) {

  let _parentModule = new NodeModule(filePath);
  _parentModule.filename = filePath;
  _parentModule.paths = NodeModule._nodeModulePaths(path.dirname(filePath));

  function SandboxRequire(file) {
    let fileName = resolve(file);

    if (cache[fileName]) {
      return cache[fileName];
    }

    let fileSource = fs.readFileSync(fileName, 'utf8');

    let currentModule = new NodeModule(fileName, _parentModule);
    currentModule.filename = fileName;

    let locals = getLocals(currentModule, createSandboxRequire(fileName, globals));

    fileSource =
      `(function(global, ${ Object.keys(locals).join(', ') }) {
        ${fileSource}
      });`;

    updateGlobals();

    var runFn = vm.runInNewContext(fileSource, globals, fileName);

    let _localValues = [];
    for (let key in locals) {
      if (locals.hasOwnProperty(key)) {
        _localValues.push(locals[key]);
      }
    }

    // Run our Function inside of the new context.
    runFn.apply(currentModule.exports, [globals].concat(_localValues));

    // Cache the new exports
    cache[fileName] = currentModule.exports;

    return currentModule.exports;
  }

  function updateGlobals() {
    for (var globalKey in global) {
      if (!globals.hasOwnProperty(globalKey)) {
        globals[globalKey] = global[globalKey];
      }
    }
  }

  function getLocals(module: NodeModule, requireFn: Function): any {
    return {
      __filename: filePath,
      __dirname: path.dirname(filePath),
      module: module,
      exports: module.exports,
      require: requireFn
    };
  }

  function resolve(moduleName) {
    var resolved = NodeModule._resolveFilename(moduleName, _parentModule);
    return (resolved instanceof Array) ? resolved[1] : resolved;
  }

  SandboxRequire['resolve'] = resolve;

  return SandboxRequire;

}

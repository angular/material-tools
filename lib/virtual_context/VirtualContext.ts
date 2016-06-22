import {createSandboxRequire} from './SandboxRequire';

export class VirtualContext {

  private _globals: any;

  /**
   * Creates a virtual context, which allows developers to run files inside of a new V8
   * JavaScript Instance.
   * Also supports a Sandboxed NodeJS environment in the new V8 context.
   * @param globals Custom global variables to be applied to the Virtual Context.
   */
  constructor(globals?: any) {
    this._globals = this._defaultGlobals;

    // Apply the custom globals from the developer to the default globals
    // without modifying the globals reference, because otherwise we would
    // lose the circular references.
    for (let _key in globals) {
      if (globals.hasOwnProperty(_key)) {
        this._globals[_key] = globals[_key];
      }
    }
  }

  private get _defaultGlobals(): any {
    let _createNoop = (returnVal?) => () => returnVal;

    let _node = {
      pathname: '',
      setAttribute: _createNoop(),
      getAttribute: () => '',
      prototype: {
        contains: _createNoop()
      }
    };

    let _document = {
      addEventListener: _createNoop(),
      querySelector: _createNoop(_node),
      createElement: _createNoop(_node),
    };

    var globals = {
      addEventListener: _createNoop(),
      document: _document,
      Node: _node,
      location: {},
      console: console
    };

    globals['window'] = globals;

    return globals;
  }

  /**
   * Runs the specified file inside of the Virtual Context and returns the syncronized module exports from
   * the second V8 instance.
   * @param fileName File which will be run inside of the Virtual Context.
   * @returns {Object} Module Exports of the given file
   */
  run(fileName: string): any {
    return createSandboxRequire(__filename, this._globals)(fileName);
  }

}
import {createSandboxRequire, SandboxRequireOptions} from './SandboxRequire';
import {BrowserWindow} from './BrowserMock';

export class VirtualContext {

  globals: BrowserWindow;

  /**
   * Creates a virtual context, which allows developers to run files inside of a new V8
   * JavaScript Instance.
   * Also supports a Sandboxed NodeJS environment in the new V8 context.
   * @param globals Custom global variables to be applied to the Virtual Context.
   */
  constructor(globals?: any) {
    this.globals = new BrowserWindow();

    // Apply the custom globals from the developer to the default globals
    // without modifying the globals reference, because otherwise we would
    // lose the circular references.
    for (let _key in globals) {
      if (globals.hasOwnProperty(_key)) {
        this.globals[_key] = globals[_key];
      }
    }
  }

  /**
   * Runs the specified file inside of the Virtual Context and returns the synchronized module exports from
   * the second V8 instance.
   * @param fileName File which will be run inside of the Virtual Context.
   * @param options Options for the Sandboxed Require
   * @returns {Object} Module Exports of the given file
   */
  run(fileName: string, options?: SandboxRequireOptions): any {
    return createSandboxRequire(__filename, this.globals, options)(fileName);
  }

}
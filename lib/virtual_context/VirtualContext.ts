import {BrowserWindow} from './MockBrowser';
import {Utils} from '../common/Utils';
import {createSandboxRequire, SandboxRequireOptions} from './SandboxRequire';

export class VirtualContext {

  globals: BrowserWindow;

  /**
   * Creates a virtual context, which allows developers to run files inside of a new V8
   * JavaScript Instance.
   * The virtual context includes a sandboxed NodeJS environment inside of the V8 machine.
   */
  constructor(globals?: any) {
    this.globals = new BrowserWindow();

    // Apply the custom globals from the developer to the default globals
    // without modifying the globals reference, because otherwise we would
    // lose the circular references.
    Utils.forEach(globals, (value, key) => this.globals[key] = value);
  }

  /**
   * Runs the specified file inside of the Virtual Context and returns the synchronized module exports from
   * the second V8 instance.
   */
  run(fileName: string, options?: SandboxRequireOptions): any {
    return createSandboxRequire(__filename, this.globals, options)(fileName);
  }

}

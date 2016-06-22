import {createSandboxRequire} from './SandboxRequire';

export class VirtualContext {

  private _globals: any;

  constructor(globals?: any) {
    this._globals = this._defaultGlobals;
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

  run(fileName: string): any {
    return createSandboxRequire(__filename, this._globals)(fileName);
  }

}
import {VirtualContext} from '../lib/virtual_context/VirtualContext';
import * as path from 'path';
import {setSandboxRequireCache} from '../lib/virtual_context/SandboxRequire';

describe('virtual context', () => {

  beforeEach(() => {
    this.virtualContext = new VirtualContext();
  });

  afterEach(() => {
    // Clear the cache of the virtual context after each command.
    setSandboxRequireCache({});
  });

  it('should properly resolve the exports from the virtual machine', () => {

    let filePath = path.normalize(__dirname + '/fixtures/virtual-context/fake-virtual-context.js');
    let exports = this.virtualContext.run(filePath);

    // The external file, which will be included inside of the fake file, will export an
    // array with all numbers from zero to 49;
    expect(exports.numbers.length).toBe(50);
  });

  it('should properly set the globals', () => {

    let filePath = path.normalize(__dirname + '/fixtures/virtual-context/fake-virtual-context.js');

    let exports = this.virtualContext.run(filePath);

    expect(path.normalize(exports.module.filename)).toBe(filePath);
    expect(path.normalize(exports.__filename)).toBe(filePath);
    expect(path.normalize(exports.__dirname)).toBe(path.dirname(filePath));
    expect(exports.require).toBeTruthy();
  });

  describe('with block scope scripts', () => {

    it('should run properly when strict mode is manually enabled', () => {
      let filePath = path.normalize(__dirname + '/fixtures/virtual-context/fake-virtual-context-strict-mode.js');

      let numbers = this.virtualContext.run(filePath, true);

      // The strict mode file will export an array of 50 numbers by using the block scope (strict mode)
      expect(numbers.length).toBe(50);
    });


    it('should throw an error when strict mode is disabled', () => {
      let filePath = path.normalize(__dirname + '/fixtures/virtual-context/fake-virtual-context-strict-mode.js');

      // The virtual context will throw an error, because the file uses block-scoped declarations outside of
      // strict mode.
      expect(() => {
        this.virtualContext.run(filePath, false);
      }).toThrow();
    });

  });

});
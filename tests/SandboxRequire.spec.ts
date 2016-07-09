import {createSandboxRequire} from '../lib/virtual_context/SandboxRequire';

describe('sandbox require', () => {

  it('should properly require a file in the new virtual machine', () => {
    let require = createSandboxRequire(__filename, {});

    let exports = require('./fixtures/virtual-context/fake-virtual-context-exports');

    expect(exports.length).toBe(50);
  });

  it('should not compile the require file twice', () => {
    let require = createSandboxRequire(__filename, {});

    let exports = require('./fixtures/virtual-context/fake-virtual-context-exports');

    expect(exports.length).toBe(50);

    // Modify the current exports reference to validate that that the *new* exports
    // are using the same reference.
    exports.push(51);

    let secondExports = require('./fixtures/virtual-context/fake-virtual-context-exports');

    expect(secondExports.length).toBe(51);
  });

  it('should not use the cache if disabled', () => {
    let require = createSandboxRequire(__filename, {}, {
      caching: false
    });

    let exports = require('./fixtures/virtual-context/fake-virtual-context-exports');

    expect(exports.length).toBe(50);

    // Modify the current exports reference to validate that that the *new* exports
    // are using the same reference.
    exports.push(51);

    let secondExports = require('./fixtures/virtual-context/fake-virtual-context-exports');

    expect(secondExports.length).toBe(50);
  });


});

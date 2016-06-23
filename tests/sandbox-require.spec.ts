import {createSandboxRequire, setSandboxRequireCache} from '../lib/virtual_context/SandboxRequire';

describe('sandbox require', () => {

  it('should properly require a file in the new virtual machine', () => {
    let require = createSandboxRequire(__filename, {});

    let exports = require('./fixtures/fake-virtual-context-external');

    expect(exports.length).toBe(50);
  });

  it('should not compile the require file twice', () => {
    let require = createSandboxRequire(__filename, {});

    let exports = require('./fixtures/fake-virtual-context-external');

    expect(exports.length).toBe(50);

    // Modify the current exports reference to validate that that the *new* exports
    // are using the same reference.
    exports.push(51);

    let secondExports = require('./fixtures/fake-virtual-context-external');

    expect(secondExports.length).toBe(51);

    // Reset the cache, because we don't want to have the changed exports in other test suites.
    setSandboxRequireCache({});
  });

  it('should probably clear the cache', () => {
    let require = createSandboxRequire(__filename, {});

    let exports = require('./fixtures/fake-virtual-context-external');

    expect(exports.length).toBe(50);

    // Modify the current exports reference to validate that that the *new* exports
    // are using the same reference.
    exports.push(51);

    // Clear the cache to avoid, that the previous changed exports are used for the new require.
    setSandboxRequireCache({});

    let secondExports = require('./fixtures/fake-virtual-context-external');

    expect(secondExports.length).toBe(50);
  });


});
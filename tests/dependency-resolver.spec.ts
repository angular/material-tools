import {DependencyResolver} from '../lib/dependency/dependency-resolver';
import * as path from 'path';

let NodeModule = require('module');

describe('Dependency Resolver', () => {

  let _resolveFilename = NodeModule._resolveFilename;

  beforeAll(() => {
    this.resolver = new DependencyResolver();

    // Overwrite the resolveFilename function from the NodeJS module resolution.
    // All Angular Material includes should be referred to the faked module fixture.
    // This would prevent the dependencies from changing through different ngMaterial
    // versions.
    NodeModule._resolveFilename = function(moduleName, parentModule) {
      if (moduleName === 'angular-material') {
        return path.normalize(`${__dirname}/fixtures/fake-angular-module.js`);
      }

      // Once it's not the Angular Material module, we fallback to the default resolveFilename
      // function.
      return _resolveFilename.apply(this, arguments);
    }
  });

  afterAll(() => {
    // Reset the resolveFilename to default NodeJS implementation.
    NodeModule._resolveFilename = _resolveFilename;
  });

  it('should properly resolve flat dependencies', () => {
    let dependencies = this.resolver.resolve(['list']);

    expect(dependencies._flat).toEqual(['list', 'core', 'theming']);
  });

  it('should properly resolve single dependencies', () => {
    let dependencies = this.resolver.resolve(['list']);

    expect(dependencies.list).toContain('core');
  });

  it('should properly resolve nested dependencies', () => {
    let dependencies = this.resolver.resolve(['list']);

    expect(dependencies.list).toContain('core');
    expect(dependencies.core).toContain('theming');
  });

});
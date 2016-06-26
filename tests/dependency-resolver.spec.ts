import {DependencyResolver} from '../lib/dependency/DependencyResolver';

describe('Dependency Resolver', () => {

  const filename = `${__dirname}/fixtures/dependency/fake-angular-module.js`;

  beforeAll(() => {
    this.resolver = new DependencyResolver();
  });

  it('should properly resolve flat dependencies', () => {
    let dependencies = this.resolver.resolve(['list'], filename);

    expect(dependencies._flat).toEqual(['list', 'core', 'theming']);
  });

  it('should properly resolve single dependencies', () => {
    let dependencies = this.resolver.resolve(['list'], filename);

    expect(dependencies.list).toContain('core');
  });

  it('should properly resolve nested dependencies', () => {
    let dependencies = this.resolver.resolve(['list'], filename);

    expect(dependencies.list).toContain('core');
    expect(dependencies.core).toContain('theming');
  });

});

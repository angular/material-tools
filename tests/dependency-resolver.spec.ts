import {DependencyResolver} from '../lib/resolvers/DependencyResolver';

describe('Dependency Resolver', () => {

  const filename = `${__dirname}/fixtures/dependency/fake-angular-module.js`;

  beforeAll(() => {
    this.resolver = new DependencyResolver();
  });

  it('should properly resolve flat dependencies', () => {
    let dependencies = this.resolver.resolve(filename, ['list']);

    expect(dependencies._flat).toEqual(['list', 'core', 'theming']);
  });

  it('should properly resolve single dependencies', () => {
    let dependencies = this.resolver.resolve(filename, ['list']);

    expect(dependencies.list).toContain('core');
  });

  it('should properly resolve nested dependencies', () => {
    let dependencies = this.resolver.resolve(filename, ['list']);

    expect(dependencies.list).toContain('core');
    expect(dependencies.core).toContain('theming');
  });

  it('should be able to get all modules', () => {
    let dependencies = this.resolver.resolve(filename)._flat;

    expect(dependencies).toContain('core');
    expect(dependencies).toContain('theming');
    expect(dependencies).toContain('list');
    expect(dependencies).toContain('autocomplete');
  });
});

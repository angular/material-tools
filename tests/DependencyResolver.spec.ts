import {DependencyResolver} from '../lib/resolvers/DependencyResolver';

describe('Dependency Resolver', () => {

  const filename = `${__dirname}/fixtures/dependency/fake-angular-module.js`;

  it('should properly resolve flat dependencies', () => {
    let dependencies = DependencyResolver.resolve(filename, ['list']);

    expect(dependencies._flat).toEqual(['list', 'core', 'theming']);
  });

  it('should properly resolve single dependencies', () => {
    let dependencies = DependencyResolver.resolve(filename, ['list']);

    expect(dependencies.list).toContain('core');
  });

  it('should properly resolve nested dependencies', () => {
    let dependencies = DependencyResolver.resolve(filename, ['list']);

    expect(dependencies.list).toContain('core');
    expect(dependencies.core).toContain('theming');
  });

  it('should be able to get all modules', () => {
    let dependencies = DependencyResolver.resolve(filename)._flat;

    expect(dependencies).toContain('core');
    expect(dependencies).toContain('theming');
    expect(dependencies).toContain('list');
    expect(dependencies).toContain('autocomplete');
  });
});

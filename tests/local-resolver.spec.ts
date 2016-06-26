import {LocalResolver} from '../lib/resolvers/LocalResolver';
import * as path from 'path';

describe('Local Resolver', () => {

  const modules = ['tooltip'];
  const directory = path.resolve('./tests/fixtures/local-resolver/');

  beforeAll(() => {
    this.resolver = new LocalResolver();
  });

  it('should resolve the JS and CSS files', done => {
    this.resolver.resolve(modules, directory).then(files => {
      reduceToFilenames(files);

      expect(files.js).toContain('tooltip.js');
      expect(files.css).toContain('tooltip.css');

      done();
    }, done.fail);
  });

  it('should not include themes in the CSS', done => {
    this.resolver.resolve(modules, directory).then(files => {
      reduceToFilenames(files);

      expect(files.css).not.toContain('tooltip-default-theme.css');

      done();
    }, done.fail);
  });

  it('should have the themes separately', done => {
    this.resolver.resolve(modules, directory).then(files => {
      reduceToFilenames(files);

      expect(files.themes).toContain('tooltip-default-theme.css');

      done();
    }, done.fail);
  });

  it('should not pick up the minified files', done => {
    this.resolver.resolve(modules, directory).then(files => {
      reduceToFilenames(files);

      expect(files.js).not.toContain('tooltip.min.js');
      expect(files.css).not.toContain('tooltip.min.css');

      done();
    }, done.fail);
  });

  it('should reject for an invalid file path', done => {
    this.resolver.resolve(modules, '/some/random/path/').then(done.fail, done);
  });

  it('should reject for an unexisting module', done => {
    this.resolver.resolve(['time-machine'], directory).then(done.fail, done);
  });

  // Util that strips the directories so they're easier to match
  function reduceToFilenames(input: any): void {
    Object.keys(input).forEach(key => {
      input[key] = input[key].map(current => path.basename(current));
    });
  }

});

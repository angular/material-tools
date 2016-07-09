import * as path from 'path';
import {LocalResolver} from '../lib/resolvers/FileResolver';

const merge = require('merge');

describe('Local Resolver', () => {

  const tooltip = ['tooltip'];
  const root = path.resolve('./tests/fixtures/local-resolver/');
  const versionData = {
    root: root,
    module: path.join(root, 'module'),
    source: path.resolve(root, 'source'),
    version: '1.1.0',
    isPost1_1: true
  };

  it('should resolve the JS and CSS files', done => {
    LocalResolver.resolve(tooltip, versionData).then(files => {
      reduceToFilenames(files);

      expect(files.js).toContain('tooltip.js');
      expect(files.css).toContain('tooltip.css');

      done();
    }, done.fail);
  });

  it('should not include themes in the CSS', done => {
    LocalResolver.resolve(tooltip, versionData).then(files => {
      reduceToFilenames(files);

      expect(files.css).not.toContain('tooltip-default-theme.css');

      done();
    }, done.fail);
  });

  it('should have the themes separately', done => {
    LocalResolver.resolve(tooltip, versionData).then(files => {
      reduceToFilenames(files);

      expect(files.themes).toContain('tooltip-default-theme.css');

      done();
    }, done.fail);
  });

  it('should not pick up the minified files', done => {
    LocalResolver.resolve(tooltip, versionData).then(files => {
      reduceToFilenames(files);

      expect(files.js).not.toContain('tooltip.min.js');
      expect(files.css).not.toContain('tooltip.min.css');

      done();
    }, done.fail);
  });

  it('should reject for an invalid file path', done => {
    let versionDataCopy = merge({}, versionData, { module: './some/random/path/' });
    LocalResolver.resolve(tooltip, versionDataCopy).then(done.fail, done);
  });

  it('should reject for an unexisting module', done => {
    LocalResolver.resolve(['time-machine'], versionData).then(done.fail, done);
  });

  it('should resolve, even if it did not find any CSS', done => {
    LocalResolver.resolve(['noCSS'], versionData).then(files => {
      expect(files.css.length).toBe(0);
      expect(files.themes.length).toBe(0);

      done();
    }, done.fail);
  });

  it('should reject if it did not find any js', done => {
    LocalResolver.resolve(['noJS'], versionData).then(done.fail, done);
  });

  // Util that strips the directories so they're easier to match
  function reduceToFilenames(input: any): void {
    Object
      .keys(input)
      .filter(key => Array.isArray(input[key]))
      .forEach(key => {
        input[key] = input[key].map(current => path.basename(current));
      });
  }

});

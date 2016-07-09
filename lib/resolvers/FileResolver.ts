import * as path from 'path';
import {MaterialToolsPackage} from './PackageResolver';

const glob = require('glob');

export class LocalResolver {

  /**
   * Looks up files that match a glob pattern.
   * When marking as required and no files could be found, the Promise will be rejected.
   */
  private static resolvePattern(pattern: string, dir: string, required = true): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(pattern, { root: dir, nocase: true }, (error, files) => {
        if (error || (required && (!files || !files.length))) {
          reject(error || `Could not find files matching ${glob} in ${dir}.`);
        } else {
          resolve(files);
        }
      });
    });
  }

  /**
   * Looks up files, with a given extension, in the file system.
   * Excludes minified files and themes.
   */
  private static resolveExtension(modules: string[], extname: string, ...rest): Promise<string[]> {
    let pattern = `/*(${modules.join('|')})/**/!(*.min|*-theme).${extname}`;
    return this.resolvePattern.call(this, pattern, ...rest);
  }

  /**
   * Looks up the theme files for an array of modules.
   * Returns a promise which resolves with an array of the required theme files.
   */
  private static resolveThemes(modules: string[], ...rest): Promise<string[]> {
    let pattern = `/*(${modules.join('|')})/**/*-theme.+(scss|css)`;
    return this.resolvePattern.call(this, pattern, ...rest, false);
  }

  /**
   * Looks up for all SCSS files, related to the specified modules.
   * Returns a promise which resolves with an array of the required SCSS files.
   */
  private static resolveSCSS(modules: string[], sourceDirectory: string): Promise<string[]> {
    return Promise.all([
      this.resolveExtension(modules, 'scss', path.join(sourceDirectory, 'components'), false),
      this.resolvePattern('/*.scss', path.join(sourceDirectory, 'core', 'style'), false)
    ]).then(data => {
      return data[0].concat(data[1]);
    });
  }

  /**
   * Resolves JS and CSS files within a directory.
   * Returns a promise which fulfills with the resolved files for the modules.
   */
  static resolve(modules: string[], _package: MaterialToolsPackage): Promise<MaterialToolsFiles> {
    let moduleDirectory = path.join(_package.module, 'modules');
    let jsModules = path.join(moduleDirectory, 'js');
    let sourceRoot = path.join(_package.source, 'src');
    let sourceComponents = path.join(sourceRoot, 'components');
    let layoutModules = path.join(moduleDirectory, 'layouts');

    return Promise.all([
      this.resolveExtension(modules, 'js', jsModules),
      this.resolveExtension(modules, 'css', jsModules, false),
      this.resolveThemes(modules, _package.isValidBuild ? jsModules : sourceComponents),
      this.resolvePattern('/*.+(layouts|layout-attributes).css', layoutModules, false),
      _package.isValidBuild ? [] : this.resolveSCSS(modules, sourceRoot)
    ])
    .then(results => {
      return {
        root: _package.root,
        js: results[0],
        css: results[1],
        themes: results[2],
        layout: results[3],
        scss: results[4],
      };
    });
  }

}

/** Interface for the output object of the local resolver. */
export interface MaterialToolsFiles {
  root: string;
  js: string[];
  css: string[];
  scss: string[];
  themes: string[];
  layout: string[];
}


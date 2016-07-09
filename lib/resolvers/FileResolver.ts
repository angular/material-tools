import * as path from 'path';
import {MaterialToolsPackage} from './PackageResolver';

const glob = require('glob');

export class LocalResolver {

  /**
   * Looks up files that match a glob pattern.
   * When marking as required and no files could be found, the Promise will be rejected.
   */
  private static resolvePattern(pattern: string, directory: string, required = true): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(pattern, { root: directory, nocase: true }, (error, files) => {
        if (error || (required && (!files || !files.length))) {
          reject(error || `Could not find files matching ${pattern} in ${directory}.`);
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
  private static resolveExtension(modules: string[], extension: string, ...rest): Promise<string[]> {
    let pattern = `/*(${modules.join('|')})/**/!(*.min|*-theme).${extension}`;
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
  static resolve(modules: string[], versionData: MaterialToolsPackage, isPost1_1: boolean = true): Promise<MaterialToolsFiles> {
    let moduleDirectory = path.join(versionData.module, 'modules');
    let jsModules = path.join(moduleDirectory, 'js');
    let sourceRoot = path.join(versionData.source, 'src');
    let sourceComponents = path.join(sourceRoot, 'components');

    return Promise.all([
      this.resolveExtension(modules, 'js', jsModules),
      this.resolveExtension(modules, 'css', jsModules, false),
      this.resolveThemes(modules, isPost1_1 ? jsModules : sourceComponents),
      this.resolvePattern('/*.+(layouts|layout-attributes).css', path.join(moduleDirectory, 'layouts'), false),
      isPost1_1 ? [] : this.resolveSCSS(modules, sourceRoot)
    ])
    .then(results => {
      return {
        root: versionData.root,
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


import * as path from 'path';

const glob = require('glob');

export class LocalResolver {

  /**
   * Looks up files that match a glob pattern.
   * @param {string} pattern Pattern to be looked up.
   * @param {string} directory Root directory for the pattern.
   * @param {boolean=true} required Whether to reject if no files are found.
   */
  private resolvePattern(pattern: string, directory: string, required = true) {
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
   * @param {string[]} modules Modules to be looked up.
   * @param {string} extension Extension of the files to be looked up.
   * @returns {Promise.<Array>} Contains the paths to the relevant files.
   */
  private resolveExtension(modules: string[], extension: string, ...rest) {
    let pattern = `/*(${modules.join('|')})/**/!(*.min|*-theme).${extension}`;
    return this.resolvePattern.call(this, pattern, ...rest);
  }

  /**
   * Looks up the theme files for an array of modules.
   * @param {string[]} modules The modules to be looked up.
   */
  private resolveThemes(modules: string[], ...rest) {
    let pattern = `/*(${modules.join('|')})/**/*-theme.scss`;
    return this.resolvePattern.call(this, pattern, ...rest, false);
  }

  /**
   * Looks up for all SCSS files, related to the specified modules.
   * @param modules Modules to be looked up
   * @param sourceDirectory Angular Material Source directory
   * @returns {Promise.<Array>} Promise which resolves with an array of paths to the SCSS files.
   */
  private resolveSCSS(modules: string[], sourceDirectory: string) {
    return Promise.all([
      this.resolveExtension(modules, 'scss', path.join(sourceDirectory, 'components')),
      this.resolvePattern('/*.scss', path.join(sourceDirectory, 'core', 'style'))
    ]).then(data => {
      return data[0].concat(data[1]);
    });
  }

  /**
   * Resolves JS and CSS files within a directory.
   * @param {string[]} modules Modules to be resolved.
   * @param {Object} versionDirectory The directory of the stored version files.
   * @returns {Promise.<any>} Contains the paths to the JS and CSS files.
   */
  resolve(modules: string[], versionDirectory: string): Promise<LocalBuildFiles> {
    let jsModules = path.join(versionDirectory, 'module', 'modules', 'js');
    let sourceRoot = path.join(versionDirectory, 'source', 'src');

    return Promise.all([
      this.resolveExtension(modules, 'js', jsModules),
      this.resolveExtension(modules, 'css', jsModules, false),
      this.resolveSCSS(modules, sourceRoot),
      this.resolveThemes(modules, path.join(sourceRoot, 'components'))
    ])
    .then(results => {
      return {
        root: versionDirectory,
        js: results[0],
        css: results[1],
        scss: results[2],
        themes: results[3]
      };
    });
  }

}

/** Interface for the output object of the local resolver. */
export interface LocalBuildFiles {
  root: string;
  js: string[];
  css: string[];
  scss: string[];
  themes: string[];
}

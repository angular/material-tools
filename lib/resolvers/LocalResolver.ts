let glob = require('glob');

export class LocalResolver {

  /**
   * Looks up files that match a glob pattern.
   * @param {string} pattern Pattern to be looked up.
   * @param {string} directory Root directory for the pattern.
   */
  private resolvePattern(pattern: string, directory: string) {
    return new Promise((resolve, reject) => {
      glob(pattern, { root: directory }, (error, files) => {
        if (error || !files || !files.length) {
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
   * @param {string} directory Root directory for the files.
   * @returns {Promise.<Array>} Contains the paths to the relevant files.
   */
  private resolveExtension(modules: string[], extension: string, directory: string) {
    return this.resolvePattern(`/*(${modules.join('|')})/**/!(*.min|*-theme).${extension}`, directory);
  }

  /**
   * Looks up the theme files for an array of modules.
   * @param {string[]} modules The modules to be looked up.
   * @param {string} directory Root directory for the modules.
   */
  private resolveThemes(modules: string[], directory: string) {
    return this.resolvePattern(`/*(${modules.join('|')})/**/*-theme.css`, directory);
  }

  /**
   * Resolves JS and CSS files within a directory.
   * @param {string[]} modules Modules to be resolved.
   * @param {string} directory The directory to be looked up.
   * @returns {Promise.<any>} Contains the paths to the JS and CSS files.
   */
  resolve(modules: string[], directory: string): Promise<any> {
    return Promise.all([
      this.resolveExtension(modules, 'js', directory),
      this.resolveExtension(modules, 'css', directory),
      this.resolveThemes(modules, directory)
    ])
    .then(results => {
      return {
        js: results[0],
        css: results[1],
        themes: results[2]
      };
    });
  }

}

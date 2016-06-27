let glob = require('glob');

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
    let pattern = `/*(${modules.join('|')})/**/*-theme.css`;
    return this.resolvePattern.call(this, pattern, ...rest, false);
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
      this.resolveExtension(modules, 'css', directory, false),
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

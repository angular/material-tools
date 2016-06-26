let glob = require('glob');

export class LocalResolver {

  /**
   * Looks up files, with a given extension, in the file system.
   * @param {string[]} modules Modules to be looked up.
   * @param {string} extension Extension of the files to be looked up.
   * @param {string} directory Root directory for the files.
   * @returns {Promise.<Array>} Contains the paths to the relevant files.
   */
  private resolveExtension(modules: string[], extension: string, directory: string) {
    return new Promise((resolve, reject) => {
      glob(`/*(${modules.join('|')})/**/!(*.min).${extension}`, { root: directory }, (error, files) => {
        if (error || !files || !files.length) {
          reject(error || `Could not find .${extension} files in ${directory}.`);
        } else {
          resolve(files);
        }
      });
    });
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
      this.resolveExtension(modules, 'css', directory)
    ])
    .then(results => {
      return {
        js: results[0],
        css: results[1]
      };
    });
  }

}

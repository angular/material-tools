import * as path from 'path';

let glob = require('glob');

export class LocalResolver {

  private _root: string;
  private _pattern: string;

  constructor(directory: string, modules: string[]) {
    this._root = path.join(directory, 'modules', 'js');
    this._pattern = `/*(${modules.join('|')})/**/!(*.min).`;
  }

  /**
   * Looks up files, with a given extension, in the file system.
   * @returns {Promise.<Array>} Contains the paths to the relevant files.
   */
  private resolveExtension(extension: string) {
    return new Promise((resolve, reject) => {
      glob(this._pattern + extension, { root: this._root }, (error, files) => {
        if (error || !files || !files.length) {
          reject(error || `Could not find .${extension} files in ${this._root}.`);
        } else {
          resolve(files);
        }
      });
    });
  }

  /**
   * Resolves JS and CSS files.
   * @returns {Promise.<any>} Contains the paths to the JS and CSS files.
   */
  resolve(): Promise<any> {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.resolveExtension('js'),
        this.resolveExtension('css')
      ]).then(results => {
        resolve({
          js: results[0],
          css: results[1]
        });
      }, reject);
    });
  }

}

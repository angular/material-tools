import {VersionDownloader} from '../download/VersionDownloader';
import * as path from 'path';
import * as fs from 'fs';

export class PackageResolver {

  private _cache: string;

  constructor(cache = './.material-cache/') {
    this._cache = path.resolve(cache);
  }

  /**
   * Checks whether a version is cached.
   * @param  {string} version The version to be checked.
   * @return {Promise<string>} Gets resolved if the version is
   * cached, or rejected if it is not. In both cases the
   * cache directory will be passed to the promise.
   */
  private isCached(version: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let destination = path.join(this._cache, version);

      fs.access(destination, fs.R_OK | fs.W_OK, doesNotExist => {
        if (doesNotExist) {
          reject(destination);
        } else {
          resolve(destination);
        }
      });
    });
  }

  /**
   * Resolves the directory for a version. The directory either gets taken
   * from the cache, or is downloaded via the VersionDownloader.
   * @param  {string} version Angular Material version
   * @return {Promise<string>} Resolves with the path to the directory.
   */
  resolve(version: string): Promise<string> {
    if (version === 'local') return Promise.resolve(
      path.dirname(require.resolve('angular-material'))
    );

    return new Promise((resolve, reject) => {
      this.isCached(version).then(resolve,
        downloadDestination => {
          new VersionDownloader()
            .get(version, downloadDestination)
            .then(resolve, reject);
        });
    });
  }

}

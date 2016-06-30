import {VersionDownloader} from '../download/VersionDownloader';
import * as path from 'path';
import * as fs from 'fs';

export class PackageResolver {

  private _cache: string;
  private _versionDownloader: VersionDownloader;

  constructor(cache: string) {
    this._cache = path.resolve(cache);
    this._versionDownloader = new VersionDownloader();
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
   * Resolves the directories for a version. The version either gets taken
   * from the cache, or is downloaded via the VersionDownloader.
   * @param  {string} version Angular Material version
   * @return {Promise<{Object>} Resolves with an object, containing the paths to the
   * source version and module version.
   */
  resolve(version: string): Promise<{ source: string, module: string }> {
    if (version === 'node') {
      let packageFile = path.join(path.dirname(require.resolve('angular-material')), 'package.json');
      // Load the version from the local installed Angular Material dependency.
      version = require(packageFile)['version'];
    }

    return this.isCached(version)
      .then(cacheDirectory => {
        return {
          module: path.join(cacheDirectory, 'module'),
          source: path.join(cacheDirectory, 'source')
        }
      })
      .catch(cacheDirectory => {
        return Promise.all([
          this._versionDownloader.getModuleVersion(version, path.join(cacheDirectory, 'module')),
          this._versionDownloader.getSourceVersion(version, path.join(cacheDirectory, 'source'))
        ]).then(directories => {
          return {
            module: directories[0],
            source: directories[1]
          };
        });
      });
  }

}

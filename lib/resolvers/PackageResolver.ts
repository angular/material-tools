import {VersionDownloader} from '../download/VersionDownloader';
import * as path from 'path';
import * as fs from 'fs';

export class PackageResolver {
  /**
   * Checks whether a version is cached.
   * @param  {string} path Path to be checked.
   * @return {Promise<string>} Gets resolved if the version is
   * cached, or rejected if it is not. In both cases the
   * cache directory will be passed to the promise.
   */
  private static isCached(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.R_OK | fs.W_OK, doesNotExist => {
        if (doesNotExist) {
          reject(path);
        } else {
          resolve(path);
        }
      });
    });
  }

  /**
   * Resolves the directories for a version. The version either gets taken
   * from the cache, or is downloaded via the VersionDownloader.
   * @param  {string} version Angular Material version.
   * @param  {string} cache Root directory for the cache.
   * @return {Promise<{Object>} Resolves with an object, containing the paths to the
   * source version and module version.
   */
  static resolve(version: string, cache: string): Promise<{ source: string, module: string, version: string }> {
    if (version === 'node') {
      let packageFile = path.join(path.dirname(require.resolve('angular-material')), 'package.json');
      // Load the version from the local installed Angular Material dependency.
      version = require(packageFile)['version'];
    }

    let cacheDirectory = path.join(path.resolve(cache), version);

    return this.isCached(cacheDirectory)
      .then(cacheDirectory => {
        return {
          module: path.join(cacheDirectory, 'module'),
          source: path.join(cacheDirectory, 'source'),
          version: version
        }
      })
      .catch(cacheDirectory => {
        return Promise.all([
          VersionDownloader.getModuleVersion(version, path.join(cacheDirectory, 'module')),
          VersionDownloader.getSourceVersion(version, path.join(cacheDirectory, 'source'))
        ]).then(directories => {
          return {
            module: directories[0],
            source: directories[1],
            version: version
          };
        });
      });
  }

}

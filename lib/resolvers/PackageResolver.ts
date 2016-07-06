import {VersionDownloader} from '../download/VersionDownloader';
import {Logger} from '../Logger';
import * as path from 'path';
import * as fs from 'fs';

const NodeModule = require('module');

export class PackageResolver {

  /** RegEx to retrieve the digits of a ngMaterial version. */
  private static _versionDigitRegex = /([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})(?:-rc(?:.|-)([0-9]{1,3}))?/;

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
  static resolve(version: string, cache: string): Promise<ResolvedPackage> {
    let localSourcePath = '';
    let directoryPromise: Promise<any> = null;

    if (version === 'local') {
      let retrievedData = this._retrieveLocalVersion();
      // Update the resolving version to the retrieved local version.
      version = retrievedData.version;
      localSourcePath = retrievedData.path;
    }

    let isPost1_1 = this._validateVersion(version, !!localSourcePath);

    if (localSourcePath && isPost1_1) {
      directoryPromise = Promise.resolve({ module: localSourcePath });
    } else {
      directoryPromise = this.isCached(path.join(path.resolve(cache), version));
    }

    return directoryPromise
      .then(this._resolveDirectories)
      .then(directories => {
        Logger.info('Using Angular Material version from cache.');

        return {
          root: localSourcePath || path.join(directories.module, '..'),
          module: directories.module,
          source: directories.source || '',
          version: version,
          isPost1_1: isPost1_1
        }
      })
      .catch(directories => {
        directories = this._resolveDirectories(directories);

        return Promise.all([
          VersionDownloader.getModuleVersion(version, directories.module),
          isPost1_1 ? '' : VersionDownloader.getSourceVersion(version, directories.source)
        ]).then(downloadPaths => {
          return {
            root: localSourcePath || path.join(directories.module, '..'),
            module: downloadPaths[0],
            source: downloadPaths[1],
            version: version,
            isPost1_1: isPost1_1
          };
        });

      });
  }

  /** Creates the directory paths for the cached versions */
  private static _resolveDirectories(cacheDirectory: string) {
    return {
      module: path.join(cacheDirectory, 'module'),
      source: path.join(cacheDirectory, 'source')
    }
  }

  /** Validates the current resolving version and shows warnings if necessary */
  private static _validateVersion(version: string, useLocalVersion = false): boolean {

    let versionNumber = this._getVersionNumber(version);
    let isPost1_1 = versionNumber >= this._getVersionNumber('1.1.0');

    if (versionNumber < this._getVersionNumber('1.0.0')) {
      Logger.warn(
        'Material-Tools: You are loading an unsupported version. ' +
        'Only >= v1.0.0 versions are fully supported.'
      );
    }

    if (!isPost1_1 && useLocalVersion) {
      Logger.warn(
        'Material-Tools: When using `local` as the version, the tools will ' +
        'only use the local sources if the version is later than v1.1.0'
      );
    }

    return isPost1_1;
  }

  /**
   * Generates a unique identifier / number for the specified version.
   * Those numbers can be easily compared. The higher number is the newer version.
   */
  //TODO(devversion): move into utils
  static _getVersionNumber(version): number {

    let matches = version
      .match(this._versionDigitRegex)
      .slice(1)
      .map(digit => fillDigit(digit, 3));

    function fillDigit(digitString = '999', maxSlotLength: number): string {
      let digitLength = digitString.length;

      for (let i = 0; i < maxSlotLength - digitLength; i++) {
        digitString = `0${digitString}`;
      }

      return digitString;
    }

    return parseInt(matches.join(''));
  }

  /**
   * Retrieves the local installed Angular Material version form the current Process Working Directory
   */
  private static _retrieveLocalVersion(): { path: string, version: string } {
    // Create a Node module which runs at the current process working directory.
    let _cliModule = new NodeModule(process.cwd());
    _cliModule.paths = NodeModule._nodeModulePaths(process.cwd());

    // Resolve the angular-material module form the CWD module.
    let resolvedModule = path.dirname(NodeModule._resolveFilename('angular-material', _cliModule));

    let packageFile = path.join(resolvedModule, 'package.json');

    // Load the version from the local installed Angular Material dependency.
    return {
      path: resolvedModule,
      version: require(packageFile)['version']
    };
  }

}

export type ResolvedPackage = {
  root: string
  module: string,
  source?: string,
  version: string,
  isPost1_1: boolean
}

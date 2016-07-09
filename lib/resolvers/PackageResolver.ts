import * as path from 'path';
import * as fs from 'fs';
import {Logger} from '../common/logger';
import {Utils} from '../common/utils';
import {VersionDownloader} from '../common/VersionDownloader';

const NodeModule = require('module');

export class PackageResolver {

  /**
   * Resolves the directories for a version. The version either gets taken
   * from the cache, or is downloaded via the VersionDownloader.
   * Returns a promise which resolves with the retrieved directories.
   */
  static resolve(version: string, cacheRoot: string): Promise<MaterialToolsPackage> {
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
      directoryPromise = this._isExisting(path.join(path.resolve(cacheRoot), version));
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

    let versionNumber = Utils.extractVersionNumber(version);
    let isPost1_1 = versionNumber >= Utils.extractVersionNumber('1.1.0');

    if (versionNumber < Utils.extractVersionNumber('1.0.0')) {
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

  /**
   * Checks whether the given path is available in the file system.
   * Returns a promise which resolves / rejects with the given path.
   */
  private static _isExisting(path: string): Promise<string> {
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

}

export type MaterialToolsPackage = {
  root: string
  module: string,
  source?: string,
  version: string,
  isPost1_1: boolean
}

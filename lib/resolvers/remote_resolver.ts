import {Resolver} from './resolver';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

let request = require('request');
let tar = require('tar-fs');

export class RemoteResolver implements Resolver {

  private _baseUrl: string;
  private _extension: string;
  private _cacheRoot: string;

  constructor() {
    this._baseUrl = 'https://github.com/angular/bower-material/archive/v';
    this._extension = '.tar.gz';
    this._cacheRoot = './.material-cache/';
  }

  /**
   * Checks whether a version is cached.
   * @param {String} version Version to be checked.
   * @returns {Promise.<String>} Resolves if cached. Returns the path.
   */
  private isCached(version: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let destination = path.join(this._cacheRoot, version);

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
   * Fetches the specified version from the Angular Material Repository and
   * stores it inside of a cache.
   * @returns {Promise.<String>} Path of the downloaded Angular Material version.
   */
  resolve(version: string): Promise<string> {
    if (!version) throw new Error('You have to specify a version.');

    return new Promise((resolve, reject) => {
      this.isCached(version).then(resolve, destination => {
        let rejectPromise = error => {
          console.error(error);
          reject(error);
        };

        let stream = request(this._baseUrl + version + this._extension)
          .on('error', rejectPromise)
          .on('response', response => {
            if (response.statusCode === 200) {
              stream
                .pipe(zlib.createGunzip())
                .pipe(tar.extract(destination))
                .on('error', rejectPromise)
                .on('finish', () => {
                  resolve(destination);
                  stream.destroy();
                });
            } else {
              rejectPromise(`Failed to download ${version}. Status code: ${response.statusCode}.`);
              stream.destroy();
            }
          });
      });
    });
  }
}

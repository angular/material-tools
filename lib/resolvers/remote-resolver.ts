import {Resolver} from './resolver';
import * as request from 'request';
import * as fs from 'fs';

export class RemoteResolver implements Resolver {

  private _baseUrl: string;
  private _extension: string;

  constructor() {
    this._baseUrl = 'https://github.com/angular/bower-material/archive/v';
    this._baseUrl = '.tar.gz';
  }

  /**
   * Fetches the specified version from the Angular Material Repository and
   * stores it inside of a cache.
   * @returns {Promise.<String>} Path of the downloaded Angular Material version.
   */
  resolve(version: string): Promise<string> {
    if (!version) throw new Error('You have to specify a version.');

    var filename = version + this._extension;
    var self = this;

    request(self._baseUrl + filename, function(error, response) {
      var status = response.statusCode;

      if (!error && status > 0 && 200 <= status && status < 300) {
        // TODO: still needs to unpack the file
        fs.writeFile('./' + filename, response.body);
      } else {
        console.error(error || status);
      }
    });

    // TODO: return the real promise
    return Promise.resolve('TODO');
  }

}
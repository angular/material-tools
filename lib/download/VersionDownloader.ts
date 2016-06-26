import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

let request = require('request');
let tar = require('tar-fs');

export class VersionDownloader {

  private _baseUrl: string;
  private _extension: string;

  constructor() {
    this._baseUrl = 'https://github.com/angular/bower-material/archive/v';
    this._extension = '.tar.gz';
  }

  /**
   * Fetches the specified version from the Angular Material Repository and
   * stores it inside of a cache.
   * @returns {Promise.<String>} Path of the downloaded Angular Material version.
   */
  get(version: string, destination: string): Promise<string> {
    return new Promise((resolve, reject) => {
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
              .pipe(tar.extract(destination, {
                map: header => {
                  header.name = header.name.substring(header.name.indexOf('/'));
                  return header;
                }
              }))
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
  }
}

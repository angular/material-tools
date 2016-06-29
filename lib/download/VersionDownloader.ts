import * as zlib from 'zlib';

let request = require('request');
let tar = require('tar-fs');

export class VersionDownloader {

  private _moduleRepo: string;
  private _sourceRepo: string;
  private _extension: string;

  constructor() {
    this._moduleRepo = 'https://github.com/angular/bower-material/archive/v';
    this._sourceRepo = 'https://github.com/angular/material/archive/v';
    this._extension = '.tar.gz';
  }

  private _downloadFile(url: string, destination: string) {
    return new Promise((resolve, reject) => {
      let rejectPromise = error => {
        console.error(error);
        reject(error);
      };

      let stream = request(url)
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
            rejectPromise(`Failed to download ${url}. Status code: ${response.statusCode}.`);
            stream.destroy();
          }
        });
    });
  }

  /**
   * Fetches the specified version from the Bower Material Repository and stores
   * it in the specified destination.
   * @returns {Promise.<String>} Path of the downloaded Bower Material version.
   */
  getModuleVersion(version: string, destination: string): Promise<string> {
    return this._downloadFile(this._moduleRepo + version + this._extension, destination);
  }

  /**
   * Fetches the specified version from the Angular Material Repository and
   * stores it in the specified destination.
   * @returns {Promise.<String>} Path of the downloaded Angular Material version.
   */
  getSourceVersion(version: string, destination: string): Promise<string> {
    return this._downloadFile(this._sourceRepo + version + this._extension, destination);
  }

}

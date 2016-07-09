import {Logger} from '../utils/logger';
import * as zlib from 'zlib';

let request = require('request');
let tar = require('tar-fs');

const MODULE_REPO = 'https://github.com/angular/bower-material/archive/v';
const SOURCE_REPO = 'https://github.com/angular/material/archive/v';
const EXTENSION = '.tar.gz';

export class VersionDownloader {

  private static _downloadFile(url: string, destination: string) {
    Logger.info(`Downloading ${url}.`);

    return new Promise((resolve, reject) => {
      let rejectPromise = error => {
        Logger.error(error);
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
                Logger.info(`Downloaded ${url} successfuly.`);
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
  static getModuleVersion(version: string, destination: string): Promise<string> {
    return this._downloadFile(MODULE_REPO + version + EXTENSION, destination);
  }

  /**
   * Fetches the specified version from the Angular Material Repository and
   * stores it in the specified destination.
   * @returns {Promise.<String>} Path of the downloaded Angular Material version.
   */
  static getSourceVersion(version: string, destination: string): Promise<string> {
    return this._downloadFile(SOURCE_REPO + version + EXTENSION, destination);
  }

}

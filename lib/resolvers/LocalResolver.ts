import * as path from 'path';
import {Resolver} from './Resolver';

export class LocalResolver implements Resolver {

  /**
   * Looks up for the local installed Angular Material version in the node modules.
   * @returns {Promise.<String>} Path of the local Angular Material version.
   */
  resolve(): Promise<string> {
    try {
      let entryFile = require.resolve('angular-material');
      return Promise.resolve(path.dirname(entryFile));
    } catch(e) {
      return Promise.reject(e);
    }
  }

}

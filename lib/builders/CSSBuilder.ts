import {MaterialToolsData, MaterialToolsOutput} from '../MaterialTools';

const cleanCSS = require('clean-css');
const fse = require('fs-extra');

export class CSSBuilder {
  /**
   * Generates minified and non-minified version of the CSS, based on the options.
   */
  static build(data: MaterialToolsData): MaterialToolsOutput {
    let raw = data.files.css.map(path => fse.readFileSync(path).toString()).join('\n');
    let compressed = new cleanCSS({
      // Strip the licensing info from the original file. It'll be re-added by the MaterialTools.
      keepSpecialComments: 0
    }).minify(raw);

    return {
      source: raw,
      compressed: compressed.styles
    }
  }
}

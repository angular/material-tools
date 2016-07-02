import {MaterialToolsData, MaterialToolsOutput} from '../MaterialTools';

const cleanCSS = require('clean-css');
const fse = require('fs-extra');
const formatCSS = require('cssbeautify');

export class CSSBuilder {

  /**
   * Generates minified and non-minified version of the CSS, based on the specified build data.
   */
  static build(data: MaterialToolsData): MaterialToolsOutput {
    let raw = data.files.css.map(path => fse.readFileSync(path).toString()).join('\n');
    return this._buildStylesheet(raw);
  }

  /**
   * Generates a minified and non-minified version of the specified stylesheet.
   */
  static _buildStylesheet(styleSheet: string): MaterialToolsOutput {
    let compressed = new cleanCSS({
      // Strip the licensing info from the original file. It'll be re-added by the MaterialTools.
      keepSpecialComments: 0
    }).minify(styleSheet);

    return {
      source: this._beautifyStylesheet(styleSheet),
      compressed: compressed.styles
    }
  }

  /**
   * Beautifies the specified CSS stylesheet.
   */
  private static _beautifyStylesheet(styleSheet: string): string {
    return formatCSS(styleSheet, {
      indent: '  ',
      autosemicolon: true
    });

  }
}

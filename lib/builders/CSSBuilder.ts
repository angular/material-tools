import {MaterialToolsData, MaterialToolsOutput} from '../common/Interfaces';

const cleanCSS = require('clean-css');
const fse = require('fs-extra');
const formatCSS = require('cssbeautify');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

export class CSSBuilder {

  /**
   * Generates minified and non-minified version of the CSS, based on the specified build data.
   */
  static build(data: MaterialToolsData, isPost1_1 = true): MaterialToolsCSS {

    if (isPost1_1) {

      let classLayout = data.files.layout.filter(file => file.indexOf('attributes') === -1)[0];

      return {
        noLayout: this._buildStylesheet(this._loadStyles(data.files.css)),
        layout: this._buildStylesheet(this._loadStyles(data.files.css.concat(classLayout)))
      };
    }

    // Compile the `core` module without the layout.
    // By default the `core` module includes the layout.
    let coreNoLayout = this._compileSCSS(
      this._loadStyles(
        data.files.scss
          .sort(path => (path.indexOf('variables.scss') !== -1 || path.indexOf('mixins.scss') !== -1) ? -1 : 1)
          .filter(path => path.indexOf('core') !== -1)
      )
    );

    // CSS for the components, without any layouts or structure.
    let componentCSS = this._loadStyles(
      data.files.css.filter(path => path.indexOf('core.css') === -1)
    );

    return {
      noLayout: this._buildStylesheet(coreNoLayout + componentCSS),
      layout: this._buildStylesheet(this._loadStyles(data.files.css))
    };
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

  /** Reads and concatenates CSS files */
  static _loadStyles(files: string[]): string {
    return files.map(path => fse.readFileSync(path).toString()).join('\n');
  }

  /**
   * Compiles SCSS to CSS and passes it through Autoprefixer.
   */
  static _compileSCSS(styles: string): string {
    let compiled = sass.renderSync({
      data: styles,
      outputStyle: 'compressed'
    }).css.toString();


    let prefixer = autoprefixer({
      browsers: ['last 2 versions', 'last 4 Android versions']
    });

    return postcss(prefixer).process(compiled).css;
  }

  /** Beautifies the specified CSS stylesheet */
  private static _beautifyStylesheet(styleSheet: string): string {
    return formatCSS(styleSheet, {
      indent: '  ',
      autosemicolon: true
    });
  }
}

export type MaterialToolsCSS = {
  noLayout: MaterialToolsOutput,
  layout: MaterialToolsOutput
}

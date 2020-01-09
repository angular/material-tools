import {MaterialToolsData} from '../MaterialTools';
import {DefaultConfig} from '../common/DefaultConfig';
import {MaterialToolsOutput} from './MaterialBuilder';

const cleanCSS = require('clean-css');
const fse = require('fs-extra');
const formatCSS = require('cssbeautify');
const sass = require('node-sass');
const postcss = require('postcss');
const autoprefixer = require('autoprefixer');

const BASE_SCSS_REGEX = new RegExp(`(${DefaultConfig.baseSCSSFiles.join('|')})`);

export class CSSBuilder {

  /**
   * Generates minified and non-minified version of the CSS, based on the specified build data.
   */
  static build(buildData: MaterialToolsData): MaterialToolsCSS {

    // Compile the `core` module without the layout.
    // By default the `core` module includes the layout.
    let coreNoLayout = this._compileSCSS(
      this._loadStyles(
        buildData.files.scss
          .sort(path => BASE_SCSS_REGEX.test(path) ? -1 : 1)
          .filter(path => path.indexOf('core') !== -1)
      )
    );

    // CSS for the components, without any layouts or structure.
    let componentCSS = this._loadStyles(
      buildData.files.css.filter(path => path.indexOf('core.css') === -1)
    );

    return this._buildOutput(
      buildData,
      coreNoLayout + componentCSS,
      this._loadStyles(buildData.files.css)
    );
  }

  /**
   * Generates a minified and non-minified version of the specified stylesheet.
   */
  static _buildStylesheet(styleSheet: string, license?: string): MaterialToolsOutput {
    let compressed = new cleanCSS({
      // Strip the licensing info from the original file. It'll be re-added by the MaterialTools.
      keepSpecialComments: 0
    }).minify(styleSheet);

    return {
      source: this._beautifyStylesheet(styleSheet),
      compressed: compressed.styles,
      license: license
    };
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
      overrideBrowserslist: ['last 2 versions', 'last 4 Android versions']
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

  /** Builds an output object for the generated CSS from the build data. */
  private static _buildOutput(data: MaterialToolsData, noLayout: string,
                              layout: string): MaterialToolsCSS {
    return {
      withoutLayout: this._buildStylesheet(noLayout, data.license),
      withLayout: this._buildStylesheet(layout, data.license),
      layoutFiles: data.files.layout,
      license: data.license
    };
  }
}

export type MaterialToolsCSS = {
  withoutLayout: MaterialToolsOutput,
  withLayout: MaterialToolsOutput
  layoutFiles: string[];
  license?: string;
};

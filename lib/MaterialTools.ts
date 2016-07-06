import {DependencyResolver} from './resolvers/DependencyResolver';
import {PackageResolver} from './resolvers/PackageResolver';
import {LocalResolver, LocalBuildFiles} from './resolvers/LocalResolver';

import {ThemingBuilder, MdTheme} from './theming/ThemingBuilder';
import {JSBuilder} from './builders/JSBuilder';
import {CSSBuilder} from './builders/CSSBuilder';

import * as path from 'path';

const fse = require('fs-extra');

export class MaterialTools {

  private themeBuilder: ThemingBuilder;
  private options: MaterialToolsOptions;
  private _isPost1_1: boolean = true;

  constructor(_options: MaterialToolsOptions | string) {
    if (!_options) {
      // Add a runtime check for the JS version.
      throw new Error('No options have been specified.');
    }

    this.options = typeof _options === 'string' ? require(path.resolve(_options)) : _options;

    Object.keys(DEFAULTS).forEach(key => {
      if (typeof this.options[key] === 'undefined') {
        this.options[key] = DEFAULTS[key];
      }
    });

    if (this.options.destination) {
      this.options.destination = path.resolve(this.options.destination);
    } else {
      throw new Error('You have to specify a destination.');
    }

    if (this.options.theme) {
      this.themeBuilder = new ThemingBuilder(this.options.theme)
    }
  }

  /**
   * Builds all of the files.
   */
  build(): Promise<MaterialToolsData> {

    return this._getData()
      .then(buildData => {
        // Create the destination path.
        return this._makeDirectory(this.options.destination).then(() => {
          // Copy the license to the destination.
          let filename = 'LICENSE';
          let source = path.join(buildData.files.root, 'module', filename);
          let destination = path.join(this.options.destination, filename);

          fse.copy(source, destination);

          return buildData;
        })
      })
      .then((buildData: MaterialToolsData) => {
        let base = path.join(this.options.destination, this.options.destinationFilename);
        let minifiedJSName = `${base}.min.js`;
        let js = JSBuilder.build(buildData, minifiedJSName);
        let css = CSSBuilder.build(buildData, this._isPost1_1);
        let license = this._getLicense(buildData.dependencies._flat);

        // JS files
        this._writeFile(`${base}.js`, js.source, license);
        this._writeFile(minifiedJSName, js.compressed, license);
        this._writeFile(`${minifiedJSName}.map`, js.map);

        // CSS files with layout
        this._writeFile(`${base}.css`, css.layout.source, license);
        this._writeFile(`${base}.min.css`, css.layout.compressed, license);

        // CSS files without layout
        this._writeFile(`${base}.layout-none.css`, css.noLayout.source, license);
        this._writeFile(`${base}.layout-none.min.css`, css.noLayout.compressed, license);

        if (this.options.theme) {
          let compiledCSS = this._buildStaticTheme(buildData.files);
          let themeStylesheet = CSSBuilder._buildStylesheet(compiledCSS);

          this._writeFile(`${base}.theme.min.css`, themeStylesheet.compressed, license);
          this._writeFile(`${base}.theme.css`, themeStylesheet.source, license);
        }

        buildData.files.layout.forEach(layoutFile => {
          // Retrieve the last two extension name portions.
          let suffix = path.basename(layoutFile).split('.').slice(-2).join('.');
          this._writeFile(`${base}.${suffix}`, CSSBuilder._loadStyles([layoutFile]), license);
        });

        return buildData;
      });
  }

  /**
   * Figures out all the dependencies and necessary files for a build, based on the options.
   * @return {Promise<any>} Resolves with a map, containing the necessary
   * JS and CSS files.
   */
  _getData(): Promise<MaterialToolsData> {
    const options = this.options;

    return PackageResolver
      .resolve(options.version, options.cache)
      .then(versionData => {
        // Update the resolved version, in case it was `node`.
        options.version = versionData.version;
        this._isPost1_1 = versionData.isPost1_1;

        return {
          versionData: versionData,
          dependencies: DependencyResolver.resolve(
            path.join(versionData.module, options.mainFilename),
            options.modules
          )
        };
      })
      .then(data => {
        return LocalResolver.resolve(
          data.dependencies._flat,
          data.versionData,
          this._isPost1_1
        ).then(files => {
          return {
            files: files,
            dependencies: data.dependencies
          }
        });
      });
  }

  /**
   * Builds a static theme stylesheet, based on the specified options.
   * @param buildFiles Build files to be used to generate the static theme.
   * @returns {string} Generated theme stylesheet
   */
  _buildStaticTheme(buildFiles: LocalBuildFiles): string {
    if (!this.themeBuilder) {
      return;
    }

    /** If the current version is Post v1.1.0 then we could just load the styles and build the themes */
    if (this._isPost1_1) {
      return this.themeBuilder.build(CSSBuilder._loadStyles(buildFiles.themes));
    }

    let baseSCSSFiles = [
      'variables.scss',
      'mixins.scss',
      'themes.scss'
    ];

    let scssFiles = buildFiles.scss
      .filter(file => baseSCSSFiles.indexOf(path.basename(file)) !== -1);

    let scssBaseContent = CSSBuilder._loadStyles(scssFiles);
    let themeSCSS = CSSBuilder._loadStyles(buildFiles.themes);
    let themeCSS = CSSBuilder._compileSCSS(scssBaseContent + themeSCSS);

    return this.themeBuilder.build(themeCSS);
  }

  /**
   * Promise wrapper around mkdirp.
   */
  private _makeDirectory(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fse.mkdirp(path, error => error ? reject(error) : resolve(path));
    });
  };

  /**
   * Generates the license string.
   */
  private _getLicense(modules: string[]): string {
    let lines = [
      'Angular Material Design',
      'https://github.com/angular/material',
      '@license MIT',
      'v' + this.options.version,
      'Built with: material-tools',
      'Includes modules: ' + modules.join(', '),
      '',
      `Copyright ${new Date().getFullYear()} Google Inc. All Rights Reserved.`,
      'Use of this source code is governed by an MIT-style license that can be ' +
        'found in the LICENSE file at http://material.angularjs.org/LICENSE.'
    ].map(line => ' * ' + line);

    lines.unshift('/*!');
    lines.push(' */', '\n');

    return lines.join('\n');
  }

  /**
   * Shorthand to write the file and include the license.
   */
  private _writeFile(destination: string, content: string, license = ''): void {
    fse.writeFileSync(destination, license + content);
  }
}

export const DEFAULTS: MaterialToolsOptions = {
  version: 'local',
  mainFilename: 'angular-material.js',
  destinationFilename: 'angular-material',
  cache: './.material-cache/'
};

export interface MaterialToolsOptions {
  destination?: string;
  modules?: string[];
  version?: string;
  theme?: MdTheme;
  mainFilename?: string;
  cache?: string;
  destinationFilename?: string;
}

export interface MaterialToolsData {
  files: LocalBuildFiles,
  dependencies: any
}

export interface MaterialToolsFile {
  source: string;
  compressed: string;
  map?: string;
}

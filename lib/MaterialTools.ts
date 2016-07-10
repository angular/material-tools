import * as path from 'path';
import {JSBuilder} from './builders/JSBuilder';
import {CSSBuilder} from './builders/CSSBuilder';
import {ThemeBuilder, MdTheme} from './builders/ThemeBuilder';
import {Utils} from './common/Utils';
import {PackageResolver} from './resolvers/PackageResolver';
import {DependencyResolver} from './resolvers/DependencyResolver';
import {LocalResolver, MaterialToolsFiles} from './resolvers/FileResolver';

const fse = require('fs-extra');

export class MaterialTools {

  private _isValidBuild: boolean = true;
  private _options: MaterialToolsOptions;
  private _outputBase: string;
  private themeBuilder: ThemeBuilder;

  constructor(_options: MaterialToolsOptions | string) {

    if (!_options) {
      throw new Error('No options have been specified.');
    }

    this._options = typeof _options === 'string' ? require(path.resolve(_options)) : _options;

    Utils.forEach(DEFAULT_OPTIONS, (value, key) => {
      if (typeof this._options[key] === 'undefined') {
        this._options[key] = value;
      }
    });

    if (this._options.destination) {
      this._options.destination = path.resolve(this._options.destination);
    } else {
      throw new Error('You have to specify a destination.');
    }

    if (this._options.theme) {
      this.themeBuilder = new ThemeBuilder(this._options.theme);
    }

    this._outputBase = path.join(this._options.destination, this._options.destinationFilename);
  }

  /**
   * Builds all of the files.
   */
  build(): Promise<MaterialToolsData> {
    return this._getData()
      .then((buildData: MaterialToolsData) => {
        return Promise.all([
          this.buildJS(buildData),
          this.buildCSS(buildData),
          this.buildTheme(buildData)
        ]).then(() => {
          let filename = 'LICENSE';
          let source = path.join(buildData.files.root, 'module', filename);
          let destination = path.join(this._options.destination, filename);

          // We don't have to wait for the license to be copied over.
          this._writeFile(destination, fse.readFileSync(source));

          return buildData;
        });
      });
  }


  /**
   * Figures out all the dependencies and necessary files for a build, based on the options.
   */
  _getData(): Promise<MaterialToolsData> {
    const options = this._options;

    return PackageResolver
      .resolve(options.version, options.cache)
      .then(versionData => {
        // Update the resolved version, in case it was `node`.
        options.version = versionData.version;
        this._isValidBuild = versionData.isValidBuild;

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
          data.versionData
        ).then(files => {
          return {
            files: files,
            dependencies: data.dependencies
          };
        });
      });
  }

  /**
   * Outputs the CSS, based on the options.
   */
  buildCSS(buildData?: MaterialToolsData): Promise<MaterialToolsData> {
    let promise = buildData ? Promise.resolve(buildData) : this._getData();

    return promise
      .then((data: MaterialToolsData) => {
        let base = this._outputBase;
        let css = CSSBuilder.build(data, this._isValidBuild);
        let license = this._getLicense(data.dependencies._flat);

        let outputPromises = data.files.layout.map(layoutFile => {
          // Retrieve the last two extension name portions.
          let suffix = path.basename(layoutFile).split('.').slice(-2).join('.');
          let styles = CSSBuilder._loadStyles([layoutFile]);

          return this._writeFile(`${base}.${suffix}`, styles, license);
        }).concat([
          // Files with layout
          this._writeFile(`${base}.css`, css.layout.source, license),
          this._writeFile(`${base}.min.css`, css.layout.compressed, license),

          // Files without layout
          this._writeFile(`${base}.layout-none.css`, css.noLayout.source, license),
          this._writeFile(`${base}.layout-none.min.css`, css.noLayout.compressed, license)
        ]);

        return Promise.all(outputPromises).then(() => data);
      });
  }

  /**
   * Outputs the necessary JS, based on the options.
   */
  buildJS(buildData?: MaterialToolsData): Promise<MaterialToolsData> {
    let promise = buildData ? Promise.resolve(buildData) : this._getData();

    return promise
      .then((data: MaterialToolsData) => {
        let minifiedJSName = `${this._outputBase}.min.js`;
        let js = JSBuilder.build(data, minifiedJSName);
        let license = this._getLicense(data.dependencies._flat);

        return Promise.all([
          this._writeFile(`${this._outputBase}.js`, js.source, license),
          this._writeFile(minifiedJSName, js.compressed, license),
          this._writeFile(`${minifiedJSName}.map`, js.map)
        ]).then(() => data);
      });
  }

  /**
   * Outputs a static theme stylesheet, based on the specified options
   */
  buildTheme(buildData?: MaterialToolsData): Promise<MaterialToolsData> {
    if (!this.themeBuilder) {
      return;
    }

    let promise = buildData ? Promise.resolve(buildData) : this._getData();

    return promise
      .then((data: MaterialToolsData) => {
        let themeStylesheet = null;
        let license = this._getLicense(data.dependencies._flat);

        // In Post v1.1.0 versions, we could just load the styles and build the themes.
        if (this._isValidBuild) {
          themeStylesheet = this.themeBuilder.build(CSSBuilder._loadStyles(data.files.themes));
        } else {
          let baseSCSSFiles = [
            'variables.scss',
            'mixins.scss',
            'themes.scss'
          ];

          let scssFiles = data.files.scss
            .filter(file => baseSCSSFiles.indexOf(path.basename(file)) !== -1);

          let scssBaseContent = CSSBuilder._loadStyles(scssFiles);
          let themeSCSS = CSSBuilder._loadStyles(data.files.themes);
          let themeCSS = CSSBuilder._compileSCSS(scssBaseContent + themeSCSS);

          themeStylesheet = this.themeBuilder.build(themeCSS);
        }

        let output = CSSBuilder._buildStylesheet(themeStylesheet);

        return Promise.all([
          this._writeFile(`${this._outputBase}.theme.min.css`, output.compressed, license),
          this._writeFile(`${this._outputBase}.theme.css`, output.source, license)
        ]).then(() => data);
      });
  }

  /** Generates the license string */
  private _getLicense(modules: string[]): string {
    let lines = [
      'Angular Material Design',
      'https://github.com/angular/material',
      '@license MIT',
      'v' + this._options.version,
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

  /** Writes a given content with the associated license to a new file */
  private _writeFile(destination: string, content: string, license = ''): Promise<string> {
    return new Promise((resolve, reject) => {
      fse.mkdirp(path.dirname(destination), error => {
        if (error) {
          reject(error);
        } else {
          fse.writeFileSync(destination, license + content);
          resolve(destination);
        }
      });
    });
  }
}

/** Material Tools Output File */
export interface MaterialToolsOutput {
  source: string;
  compressed: string;
  map?: string;
}

/** Resolved data for the specified version */
export interface MaterialToolsData {
  files: MaterialToolsFiles;
  dependencies: any;
}

/** Valid options for the Material Tools */
export interface MaterialToolsOptions {
  destination?: string;
  modules?: string[];
  version?: string;
  theme?: MdTheme;
  mainFilename?: string;
  cache?: string;
  destinationFilename?: string;
}

/** Default options for the Material Tools. */
export const DEFAULT_OPTIONS: MaterialToolsOptions = {
  version: 'local',
  cache: './.material-cache/',
  destinationFilename: 'angular-material',
  mainFilename: 'angular-material.js'
};

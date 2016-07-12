import * as path from 'path';
import {MaterialToolsData, MaterialToolsOptions} from '../MaterialTools';
import {ThemeBuilder} from './ThemeBuilder';
import {PackageResolver} from '../resolvers/PackageResolver';
import {DependencyResolver} from '../resolvers/DependencyResolver';
import {LocalResolver} from '../resolvers/FileResolver';
import {JSBuilder} from './JSBuilder';
import {CSSBuilder, MaterialToolsCSS} from './CSSBuilder';
import {DefaultConfig} from '../common/DefaultConfig';

export class MaterialBuilder {

  protected _themeBuilder: ThemeBuilder;
  protected _outputBase: string;
  protected _isValidBuild = false;

  constructor(protected _options: MaterialToolsOptions) {
    if (this._options.theme) {
      this._themeBuilder = new ThemeBuilder(this._options.theme);
    }

    this._outputBase = path.join(this._options.destination, this._options.destinationFilename);
  }

  /**
   * Figures out all the dependencies and necessary files for a build, based on the options.
   */
  _getData(): Promise<MaterialToolsData> {
    return PackageResolver
      .resolve(this._options.version, this._options.cache)
      .then(versionData => {
        // Update the resolved version, in case it was `node`.
        this._options.version = versionData.version;
        this._isValidBuild = versionData.isValidBuild;

        return {
          versionData: versionData,
          dependencies: DependencyResolver.resolve(
            path.join(versionData.module, this._options.mainFilename),
            this._options.modules
          )
        };
      })
      .then(data => {
        return LocalResolver.resolve(data.dependencies._flat, data.versionData).then(files => {
          return {
            files: files,
            dependencies: data.dependencies,
            license: this._getLicense(data.dependencies._flat)
          };
        });
      });
  }


  /**
   * Outputs the necessary JS, based on the options.
   */
  _buildJS(buildData: MaterialToolsData): MaterialToolsOutput {
    return JSBuilder.build(buildData, `${this._outputBase}.min.js`);
  }

  /**
   * Outputs the CSS, based on the options.
   */
  _buildCSS(buildData: MaterialToolsData): MaterialToolsCSS {
    return CSSBuilder.build(buildData, this._isValidBuild);
  }

  /**
   * Outputs a static theme stylesheet, based on the specified options
   */
  _buildTheme(buildData: MaterialToolsData): MaterialToolsOutput {
    if (!this._themeBuilder) {
      return;
    }

    let themeStylesheet = null;

    // In Post v1.1.0 versions, we could just load the styles and build the themes.
    if (this._isValidBuild) {
      themeStylesheet = this._themeBuilder.build(CSSBuilder._loadStyles(buildData.files.themes));
    } else {
      let baseSCSSFiles = DefaultConfig.baseSCSSFiles.concat(DefaultConfig.baseThemeFiles);

      let scssFiles = buildData.files.scss
        .filter(file => baseSCSSFiles.indexOf(path.basename(file)) !== -1);

      let scssBaseContent = CSSBuilder._loadStyles(scssFiles);
      let themeSCSS = CSSBuilder._loadStyles(buildData.files.themes);
      let themeCSS = CSSBuilder._compileSCSS(scssBaseContent + themeSCSS);

      themeStylesheet = this._themeBuilder.build(themeCSS);
    }

    return CSSBuilder._buildStylesheet(themeStylesheet, buildData.license);
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
}

/** Material Tools Output File */
export interface MaterialToolsOutput {
  source: string;
  compressed: string;
  map?: string;
  license?: string;
}

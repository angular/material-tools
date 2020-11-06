import * as path from 'path';
import {MaterialToolsData, MaterialToolsOptions} from '../MaterialTools';
import {ThemeBuilder} from './ThemeBuilder';
import {PackageResolver, MaterialToolsPackage} from '../resolvers/PackageResolver';
import {DependencyResolver} from '../resolvers/DependencyResolver';
import {LocalResolver} from '../resolvers/LocalResolver';
import {JSBuilder} from './JSBuilder';
import {CSSBuilder, MaterialToolsCSS} from './CSSBuilder';
import {DefaultConfig} from '../common/DefaultConfig';

export class MaterialBuilder {

  protected _themeBuilder: ThemeBuilder;
  protected _outputBase: string;

  constructor(protected _options: MaterialToolsOptions) {
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

        let deps = DependencyResolver.resolve(
          this._getModuleEntry(versionData),
          this._options.modules
        );

        if (this._options.excludeModules) {
            // Remove modules that were explicitly flagged to be excluded from the build
            deps._flat = deps._flat.filter(dep => this._options.excludeModules.indexOf(dep) === -1);
            deps._mainModule.dependencies = deps._mainModule.dependencies.filter(
                dep => !this._options.excludeModules.some(
                    // E.g. match 'animate' in 'material.core.animate'
                    _module => dep.indexOf(_module) !== -1
                )
            );
        }

        return {
          versionData: versionData,
          dependencies: deps
        };
      })
      .then(data => {
        return LocalResolver.resolve(data.dependencies._flat, data.versionData).then(files => {
          return {
            files: files,
            dependencies: data.dependencies,
            license: this._getLicense(data.dependencies._flat),
            package: data.versionData
          };
        });
      });
  }


  /**
   * Outputs the necessary JS, based on the options.
   */
  _buildJS(buildData: MaterialToolsData): MaterialToolsOutput {
    return JSBuilder.build(buildData, `${this._outputBase}.min.js`, this._options);
  }

  /**
   * Outputs the CSS, based on the options.
   */
  _buildCSS(buildData: MaterialToolsData): MaterialToolsCSS {
    return CSSBuilder.build(buildData);
  }

  /**
   * Outputs a static theme stylesheet, based on the specified options
   */
  _buildTheme(buildData: MaterialToolsData): MaterialToolsOutput {
    if (!this._options.theme && !this._options.themes) {
      return;
    }

    if (!this._themeBuilder) {
      let themes = (this._options.themes || []).concat(this._options.theme || []);
      let moduleName = this._getModuleEntry(buildData.package);

      this._themeBuilder = new ThemeBuilder(themes, this._options.palettes, moduleName);
    }

    let baseSCSSFiles = DefaultConfig.baseSCSSFiles.concat(DefaultConfig.baseThemeFiles);

    let scssFiles = buildData.files.scss
      .filter(file => baseSCSSFiles.indexOf(path.basename(file)) !== -1);

    let scssBaseContent = CSSBuilder._loadStyles(scssFiles);
    let themeSCSS = CSSBuilder._loadStyles(buildData.files.themes);
    let themeCSS = CSSBuilder._compileSCSS(scssBaseContent + themeSCSS);

    let themeStylesheet = this._themeBuilder.build(themeCSS);

    return CSSBuilder._buildStylesheet(themeStylesheet, buildData.license);
  }

  /** Generates the license string */
  private _getLicense(modules: string[]): string {
    let lines = [
      'AngularJS Material Design',
      'https://github.com/angular/material',
      '@license MIT',
      'v' + this._options.version,
      'Built with: angular-material-tools',
      'Includes modules: ' + modules.join(', '),
      '',
      `Copyright ${new Date().getFullYear()} Google LLC. All Rights Reserved.`,
      'Use of this source code is governed by an MIT-style license that can be ' +
      'found in the LICENSE file at http://material.angularjs.org/LICENSE.'
    ].map(line => ' * ' + line);

    lines.unshift('/*!');
    lines.push(' */', '\n');

    return lines.join('\n');
  }

  /** Retrieves the module entry path from the specified package. */
  private _getModuleEntry(toolsPackage: MaterialToolsPackage) {
    return path.join(toolsPackage.module, this._options.mainFilename);
  }
}

/** Material Tools Output File */
export interface MaterialToolsOutput {
  source: string;
  compressed: string;
  map?: string;
  license?: string;
}

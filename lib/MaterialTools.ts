import * as path from 'path';
import {CSSBuilder, MaterialToolsCSS} from './builders/CSSBuilder';
import {MdTheme, MdPaletteDefinition} from './builders/ThemeBuilder';
import {Utils} from './common/Utils';
import {MaterialToolsFiles} from './resolvers/LocalResolver';
import {DefaultConfig} from './common/DefaultConfig';
import {MaterialBuilder, MaterialToolsOutput} from './builders/MaterialBuilder';
import {MaterialToolsPackage} from './resolvers/PackageResolver';

const fse = require('fs-extra');

const buildCommandMap = {
  css: 'buildCSS',
  js: 'buildJS',
  theme: 'buildTheme',
  themes: 'buildTheme'
};

export class MaterialTools extends MaterialBuilder {

  constructor(_options: MaterialToolsOptions | string) {

    if (!_options) {
      throw new Error('No options have been specified.');
    }

    let options = typeof _options === 'string' ? require(path.resolve(_options)) : _options;

    Utils.forEach(DefaultConfig.options, (value, key) => {
      if (typeof options[key] === 'undefined') {
        options[key] = value;
      }
    });

    if (options.destination) {
      options.destination = path.resolve(options.destination);
    } else {
      throw new Error('You have to specify a destination.');
    }

    // Initialize the MaterialBuilder with the validated options.
    super(options);
  }

  /**
   * Builds all of the files or a subset of files.
   */
  build(...buildTypes): Promise<MaterialToolsData> {
    return this._getData().then((buildData: MaterialToolsData) => {
      let commands = buildTypes
        .filter(name => !!buildCommandMap[name])
        .map(key => this[buildCommandMap[key]](buildData));

      if (!commands.length) {
        Utils.forEach(buildCommandMap, methodName => commands.push(this[methodName](buildData)));
      }

      return Promise.all(commands).then(() => {
        if (buildData.files.license) {
          // We don't have to wait for the license to be copied over.
          this._writeFile(
            path.join(this._options.destination, 'LICENSE'),
            fse.readFileSync(buildData.files.license)
          );
        }

        return buildData;
      });
    });
  }

  /**
   * Outputs the CSS, based on the options.
   * Returns a promise, which resolves at finish with the given destination paths.
   */
  buildCSS(buildData?: MaterialToolsData): Promise<string[]> {

    return this._buildData(buildData)
      .then(data => this._buildCSS(buildData))
      .then((output: MaterialToolsCSS) => {
        let base = this._outputBase;
        let license = output.license;

        // General standalone layout files directly from the module repository.
        let outputPromises = output.layoutFiles.map(layoutFile => {
          // Retrieve the last two extension name portions.
          let suffix = path.basename(layoutFile).split('.').slice(-2).join('.');
          let styles = CSSBuilder._loadStyles([layoutFile]);

          return this._writeFile(`${base}.${suffix}`, styles, output.license);
        }).concat([
          // Files with layout
          this._writeFile(`${base}.css`, output.withLayout.source, license),
          this._writeFile(`${base}.min.css`, output.withLayout.compressed, license),

          // Files without layout
          this._writeFile(`${base}.layout-none.css`, output.withoutLayout.source, license),
          this._writeFile(`${base}.layout-none.min.css`, output.withoutLayout.compressed, license)
        ]);

        return Promise.all(outputPromises);
      });
  }


  /**
   * Outputs the necessary JS, based on the options.
   * Returns a promise, which resolves at finish with the given destination paths.
   */
  buildJS(buildData?: MaterialToolsData): Promise<string[]> {

    return this._buildData(buildData)
      .then(data => this._buildJS(data))
      .then((output: MaterialToolsOutput) => {
        return Promise.all([
          this._writeFile(`${this._outputBase}.js`, output.source, output.license),
          this._writeFile(`${this._outputBase}.min.js`, output.compressed, output.license),
          this._writeFile(`${this._outputBase}.map`, output.map)
        ]);
      });
  }

  /**
   * Outputs a static theme stylesheet, based on the specified options
   * Returns a promise, which resolves at finish with the given destination paths.
   */
  buildTheme(buildData?: MaterialToolsData): Promise<string[]> {
    if (!this._options.theme && !this._options.themes) {
      return;
    }

    return this._buildData(buildData)
      .then(data => this._buildTheme(data))
      .then((output: MaterialToolsOutput) => {
        return Promise.all([
          this._writeFile(`${this._outputBase}.themes.min.css`, output.compressed, output.license),
          this._writeFile(`${this._outputBase}.themes.css`, output.source, output.license)
        ]);
      });
  }

  /** Transforms a specified build data into a promise and loads the data if not present. */
  private _buildData(buildData?: MaterialToolsData): Promise<MaterialToolsData> {
    return buildData ? Promise.resolve(buildData) : this._getData();
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

/** Resolved data for the specified version */
export interface MaterialToolsData {
  files: MaterialToolsFiles;
  dependencies: any;
  license: string;
  package: MaterialToolsPackage;
}

/** Valid options for the Material Tools */
export interface MaterialToolsOptions {
  destination?: string;
  modules?: string[];
  excludeModules?: string[];
  version?: string;
  palettes?: MdPaletteDefinition;
  mainFilename?: string;
  cache?: string;
  destinationFilename?: string;
  excludeMainModule?: boolean;
  /* Theming Options */
  theme?: MdTheme;
  themes?: MdTheme[];
}


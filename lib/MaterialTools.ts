import {DependencyResolver} from './resolvers/DependencyResolver';
import {PackageResolver} from './resolvers/PackageResolver';
import {LocalResolver, LocalBuildFiles} from './resolvers/LocalResolver';
import {ThemingBuilder, MdTheme} from './theming/ThemingBuilder';
import * as path from 'path';
import * as fs from 'fs';

const sass = require('node-sass');
const uglify = require('uglify-js');
const cleanCSS = require('clean-css');
const mkdirp = require('mkdirp');

export class MaterialTools {

  private packageResolver: PackageResolver;
  private dependencyResolver: DependencyResolver;
  private localResolver: LocalResolver;
  private themeBuilder: ThemingBuilder;

  constructor(private options: MaterialToolsOptions) {
    Object.keys(DEFAULTS).forEach(key => {
      if (typeof options[key] === 'undefined') {
        options[key] = DEFAULTS[key];
      }
    });

    if (options.destination) {
      options.destination = path.resolve(options.destination);
    } else {
      throw new Error('You have to specify a destination.');
    }

    this.packageResolver = new PackageResolver(this.options.cache);
    this.dependencyResolver = new DependencyResolver();
    this.localResolver = new LocalResolver();

    if (this.options.theme) {
      this.themeBuilder = new ThemingBuilder(this.options.theme)
    }
  }

  /**
   * Builds all of the files.
   */
  build(): Promise<MaterialToolsData> {
    return Promise.all([
      this._getData(),
      this._makeDirectory(this.options.destination)
    ]).then(buildData => {
      let data = buildData[0];
      let base = path.join(buildData[1], this.options.destinationFilename);

      let minifiedJSName = `${base}.min.js`;
      let js = this._buildJS(data, minifiedJSName);
      let css = this._buildCSS(data);

      // JS files
      fs.writeFileSync(`${base}.js`, js.source);
      fs.writeFileSync(minifiedJSName, js.compressed);
      fs.writeFileSync(`${minifiedJSName}.map`, js.map);

      // CSS files
      fs.writeFileSync(`${base}.css`, css.source);
      fs.writeFileSync(`${base}.min.css`, css.compressed);

      if (this.options.theme) {
        fs.writeFileSync(`${base}-theme.css`, this._buildStaticTheme(data.files));
      }

      return data;
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

    let themeCSS = buildFiles.themes
      .map(themeFile => fs.readFileSync(themeFile).toString())
      .map(themeSCSS => this._buildThemeStylesheet(buildFiles.scss, themeSCSS))
      .reduce((styleSheet, part) => styleSheet + part);

   return this.themeBuilder.build(themeCSS);
  }

  /**
   * Generates the minified and non-minified JS, as well as a source map, based on the options.
   */
  _buildJS(data: MaterialToolsData, filename: string): MaterialToolsOutput {
    let mainModule = data.dependencies._mainModule;
    let dependencyString = mainModule.dependencies.map(name => `'${name}'`).join(', ');
    let raw = data.files.js.map(path => fs.readFileSync(path).toString()).join('\n');
    let source =
    `
      (function() {
        "use strict";
        angular.module('${mainModule.rawName}', [${dependencyString}]);
      })();

      ${raw}
    `;

    let compressed = uglify.minify(source, {
      fromString: true,
      outSourceMap: filename
    });

    return {
      source: source,
      compressed: compressed.code,
      map: compressed.map
    }
  }

  /**
   * Generates minified and non-minified version of the CSS, based on the options.
   */
  _buildCSS(data: MaterialToolsData): MaterialToolsOutput {
    let raw = data.files.css.map(path => fs.readFileSync(path).toString()).join('\n');
    let compressed = new cleanCSS().minify(raw);

    return {
      source: raw,
      compressed: compressed.styles
    }
  }

  /**
   * Figures out all the dependencies and necessary files for a build, based on the options.
   * @return {Promise<any>} Resolves with a map, containing the necessary
   * JS and CSS files.
   */
  _getData(): Promise<MaterialToolsData> {
    const options = this.options;

    return this.packageResolver
      .resolve(options.version)
      .then(versionData => {
        return {
          versionRoot: path.resolve(versionData.module, '../'),
          dependencies: this.dependencyResolver.resolve(
            path.join(versionData.module, options.mainFilename),
            options.modules
          )
        };
      })
      .then(data => {
        return this.localResolver.resolve(
          data.dependencies._flat,
          data.versionRoot
        ).then(files => {
          return {
            files: files,
            dependencies: data.dependencies
          }
        });
      });
  }

  /**
   * Builds the specified stylesheet and includes the required SCSS base files, to access
   * the mixins and variables.
   */
  private _buildThemeStylesheet(scssFiles: string[], styleContent: string): string {

    // Those are the base SCSS files from the Angular Material Build Process.
    // It is important for the files to have a specific order, otherwise the variables
    // can't be resolved in the stylesheet.
    let baseSCSSFiles = [
      'variables.scss',
      'mixins.scss'
    ];

    scssFiles = scssFiles.filter(file => baseSCSSFiles.indexOf(path.basename(file)) !== -1);

    // Load the base SCSS files, to be able to prepend them to the style content.
    let scssBaseContent = scssFiles
      .map(scssFile => fs.readFileSync(scssFile).toString())
      .join('');

    return sass.renderSync({
      data: scssBaseContent + styleContent,
      outputStyle: 'compressed'
    }).css.toString();
  }

  /**
   * Promise wrapper around mkdirp.
   */
  _makeDirectory(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
      mkdirp(path, error => error ? reject(error) : resolve(path));
    });
  };
}

const DEFAULTS: MaterialToolsOptions = {
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

export interface MaterialToolsOutput {
  source: string;
  compressed: string;
  map?: string;
}

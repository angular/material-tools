import {DependencyResolver} from './dependency/DependencyResolver';
import {PackageResolver} from './resolvers/PackageResolver';
import {LocalResolver} from './resolvers/LocalResolver';
import * as path from 'path';

export class MaterialTools {

  private _options: any;
  private packageResolver: PackageResolver;
  private dependencyResolver: DependencyResolver;
  private localResolver: LocalResolver;

  private _defaults = {
    version: 'local',
    mainFilename: 'angular-material.js'
  };

  constructor(options: any) {
    if (!options.modules || !options.modules.length) {
      throw new Error('You have to specify an array of modules.');
    }

    this._options = this._defaults;

    Object.keys(options).forEach(key => {
      if (options.hasOwnProperty(key)) {
        this._options[key] = options[key];
      }
    });

    this.packageResolver = new PackageResolver(this._options.cache);
    this.dependencyResolver = new DependencyResolver();
    this.localResolver = new LocalResolver();
  }

  /**
   * Figures out all the necessary files for a build, based on the options.
   * @return {Promise<any>} Resolves with a map, containing the necessary
   * JS and CSS files.
   */
  getFiles(): Promise<any> {
    const options = this._options;

    return this.packageResolver
      .resolve(options.version)
      .then(root => {
        return {
          root: root,
          flatDependencies: this.dependencyResolver.resolve(
            options.modules,
            path.join(root, options.mainFilename)
          )._flat
        };
      })
      .then(data => {
        return this.localResolver.resolve(
          data.flatDependencies,
          path.join(data.root, 'modules', 'js')
        );
      });
  }
}

import {DependencyResolver} from './resolvers/DependencyResolver';
import {PackageResolver} from './resolvers/PackageResolver';
import {LocalResolver} from './resolvers/LocalResolver';
import * as path from 'path';

const DEFAULTS = {
  version: 'local',
  mainFilename: 'angular-material.js',
  cache: './.material-cache/'
}

export interface MaterialToolsOptions {
  modules: string[];
  version?: string;
  mainFilename?: string;
  cache?: string;
}

export class MaterialTools {
  private packageResolver: PackageResolver;
  private dependencyResolver: DependencyResolver;
  private localResolver: LocalResolver;

  constructor(private options: MaterialToolsOptions) {
    if (!options.modules || !options.modules.length) {
      throw new Error('You have to specify an array of modules.');
    }

    Object.keys(DEFAULTS).forEach(key => {
      if (typeof options[key] === 'undefined') {
        options[key] = DEFAULTS[key];
      }
    });

    this.packageResolver = new PackageResolver(this.options.cache);
    this.dependencyResolver = new DependencyResolver();
    this.localResolver = new LocalResolver();
  }

  /**
   * Figures out all the necessary files for a build, based on the options.
   * @return {Promise<any>} Resolves with a map, containing the necessary
   * JS and CSS files.
   */
  getFiles(): Promise<any> {
    const options = this.options;

    return this.packageResolver
      .resolve(options.version)
      .then(root => {
        return {
          root: root,
          dependencies: this.dependencyResolver.resolve(
            options.modules,
            path.join(root, options.mainFilename)
          )
        };
      })
      .then(data => {
        return this.localResolver.resolve(
          data.dependencies._flat,
          path.join(data.root, 'modules', 'js')
        );
      });
  }
}

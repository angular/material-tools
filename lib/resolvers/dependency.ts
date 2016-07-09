import {VirtualContext} from '../virtual_context/virtual_context';
import {Logger} from '../utils/logger';

export class DependencyResolver {

  /**
   * Determines the dependencies and parent dependencies of the specified
   * Angular `modules` within a `file`.
   * @param  {string} file File to be executed.
   * @param  {string[]=} modules The modules whose dependencies need to be determined.
   * @param  {string=} mainModule Name of the main wrapper module.
   * @return {Object} Contains a map of the dependencies, as well as a flat list of all of them.
   */
  static resolve(file: string, modules?: string[], mainModule?: string): any {
    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    let virtualContext = new VirtualContext({
      $$moduleName: file,
      $$mainModule: mainModule
    });

    // Execute our dependency resolve script in the virtual context, to completely
    // isolate the window modification from our node environment.
    let angular = `${__dirname}/mock_angular.js`,
        output = virtualContext.run( angular, {
          strictMode: true
        });

    let targetModules = modules && modules.length ? modules : Object.keys(output.dependencies);

    let resultMap = {
      _flat: [],
      _mainModule: output.mainModule
    };

    targetModules.forEach(function addDependencies(componentName) {
      let exists = output.dependencies.hasOwnProperty(componentName);

      if (exists && !resultMap.hasOwnProperty(componentName)) {
        let component = output.dependencies[componentName];
        let dependencies = component.dependencies;

        resultMap[componentName] = dependencies;
        resultMap._flat.push(componentName);

        if (resultMap._mainModule.dependencies.indexOf(component.rawName) === -1) {
          resultMap._mainModule.dependencies.push(component.rawName);
        }

        if (dependencies && dependencies.length) {
          dependencies.forEach(addDependencies);
        }
      } else if (!exists) {
        Logger.warn(`Module "${componentName}" does not exist and will be skipped.`);
      }
    });

    return resultMap;
  }
}
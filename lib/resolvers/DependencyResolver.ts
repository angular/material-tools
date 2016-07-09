import {Logger} from '../common/logger';
import {VirtualContext} from '../virtual_context/VirtualContext';

export class DependencyResolver {

  /**
   * Determines the dependencies and parent dependencies of the specified
   * Angular `modules` within a `file`.
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
    let output = virtualContext.run(`${__dirname}/isolated_angular.js`, {
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

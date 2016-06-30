import {VirtualContext} from '../virtual_context/VirtualContext';

export class DependencyResolver {

  /**
   * Determines the dependencies and parent dependencies of the specified
   * Angular `modules` within a `file`.
   * @param  {string} file File to be executed.
   * @param  {string[]=} modules The modules whose dependencies need to be determined.
   * @param  {string=} mainModule Name of the main wrapper module.
   * @return {Object} Contains a map of the dependencies, as well as a flat list of all of them.
   */
  resolve(file: string, modules?: string[], mainModule?: string): { _flat: string[], _mainModule: any } {
    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    let virtualContext = new VirtualContext({
      $$moduleName: file,
      $$mainModule: mainModule
    });

    // Execute our dependency resolve script in the virtual context, to completely
    // isolate the window modification from our node environment.
    let output = virtualContext.run(__dirname + '/isolated_browser_resolver.js', {
      strictMode: true
    });

    let targetModules = modules && modules.length ? modules : Object.keys(output.dependencies);

    let resultMap = {
      _flat: [],
      _mainModule: output.mainModule
    };

    targetModules.forEach(function addDependencies(componentName) {
      if (!resultMap.hasOwnProperty(componentName)) {
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
      }
    });

    return resultMap;
  }
}

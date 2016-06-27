import {VirtualContext} from '../virtual_context/VirtualContext';

export class DependencyResolver {

  /**
   * Determines the dependencies and parent dependencies of the specified
   * Angular `modules` within a `file`.
   * @param  {string[]} modules The modules whose dependencies need to be determined.
   * @param  {string} file File to be executed.
   * @return {Object} Contains a map of the dependencies, as well as a flat list of all of them.
   */
  resolve(modules: string[], file: string): any {
    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    let virtualContext = new VirtualContext({
      $$moduleName: file
    });

    // Execute our dependency resolve script in the virtual context, to completely
    // isolate the window modification from our node environment.
    let dependencyMap = virtualContext.run(__dirname + '/isolated_browser_resolver.js', true)['dependencies'];

    let resultMap = {
      _flat: []
    };

    modules.forEach(function addDependencies(component) {
      if (!resultMap.hasOwnProperty(component)) {
        let dependencies = dependencyMap[component];

        resultMap[component] = dependencies;
        resultMap._flat.push(component);

        if (dependencies && dependencies.length) {
          dependencies.forEach(addDependencies);
        }
      }
    });

    return resultMap;
  }
}

import {VirtualContext} from '../virtual_context/VirtualContext';

export class DependencyResolver {

  resolve(modules: string[]): any {
    // Create a virtual context, to isolate the script which modifies the globals
    // to be able to mock a Browser Environment.
    let virtualContext = new VirtualContext();

    // Execute our dependency resolve script in the virtual context, to completely
    // isolate the window modification from our node environment.
    var dependencyMap = virtualContext.run(__dirname + '/isolated_browser_resolver.js');
    var resultMap = {
      _flat: []
    };

    modules.forEach(function addDependencies(component) {
      if (!resultMap.hasOwnProperty(component)) {
        let dependencies = dependencyMap[component];

        resultMap[component] = dependencies;
        resultMap._flat.push(component);

        if (dependencies.length) {
          dependencies.forEach(addDependencies);
        }
      }
    });

    return resultMap;
  }
}

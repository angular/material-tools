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

    for (let component in dependencyMap) {
      if (dependencyMap.hasOwnProperty(component)) {
        if (modules.indexOf(component) !== -1) {
          resultMap[component] = dependencyMap[component];
          resultMap['_flat'] = resultMap['_flat'].concat(dependencyMap[component]);
        }
      }
    }

    return resultMap;
  }
}
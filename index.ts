import {DependencyResolver} from './lib/dependency/dependency-resolver';

let resolver = new DependencyResolver();

console.log(resolver.resolve(['datepicker']));
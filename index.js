var DependencyResolver = require('./lib/dependency-resolver');
var RemoteResolver = require('./lib/resolvers/remote-resolver');

var dependencies = new DependencyResolver();
var remote = new RemoteResolver();

console.log(dependencies.resolve());

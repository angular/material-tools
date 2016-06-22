import {LocalResolver} from './lib/resolvers/local-resolver';

new LocalResolver().resolve().then(path => {
  console.log(`Path: ${path}`);
});
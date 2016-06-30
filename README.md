# material-tools
Build tools for Angular Material

### Installation
- `npm install angular-material-tools`

### Usage

```typescript
import {MaterialTools} from './lib/MaterialTools';

let tools = new MaterialTools(options);

tools
  .build()
  .then(files => console.log(files))
  .catch(error => console.error(error));
```

### Options
* `destination: string` - Target location for the Material build.
* `modules?: string[]` - Modules that should be part of the build.
* `version: string = 'node'` - Version of Angular Material. If set to `node`, the current
Material version from the `package.json` will be loaded, otherwise it will be downloaded.
* `cache: string = './.material-cache/'` - Directory for caching downloads.
* `mainFilename: string = 'angular-material.js'` - Name of the file that will be loaded to
figure out the dependencies.

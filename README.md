# angular-material-tools
Build tools for Angular Material

## Installation
- `npm install angular-material-tools --save`

### Options
* `destination: string` - Target location for the Material build.
* `modules?: string[]` - Modules that should be part of the build. All modules will be built if nothing
is specified.
* `version: string = 'local'` - Version of Angular Material. If set to `local`, the current
Material version from the `package.json` will be loaded, otherwise it will be downloaded.
* `theme?: Object` - Map of palettes to be used when generating a pre-built theme.
Should contain the following properties: `primaryPalette`, `accentPalette`, `warnPalette`, `backgroundPalette`.
* `cache: string = './.material-cache/'` - Directory for caching downloads.
* `mainFilename: string = 'angular-material.js'` - Name of the file that will be loaded to
figure out the dependencies.
* `destinationFilename: string = 'angular-material'` - Name to be used as a base for the output files.

**Note:** The options can also be set in a JSON file whose path can be passed to the tools module.

### Usage
You can use the module either through the command line, by importing the NodeJS module or the TypeScript source.

#### NodeJS usage
```javascript
var material = require('angular-material-tools');
var tools = new material.MaterialTools({
  destination: './output',
  version: '1.0.0',
  modules: ['menu', 'checkbox']
});

tools
  .build()
  .then(() => console.log('Build was successful.'))
  .catch(error => console.error(error));
```

Note that in addition to the `MaterialTools` module, you can import the following sub-modules:
* `ThemingBuilder` - Allows you to build an individual theme.
* `PackageResolver` - Used for dealing with fetching, caching and resolving Angular Material versions.
* `VersionDownloader` - Downloads and unpacks a version of Angular Material. Gets called internally by `PackageResolver`.
* `DependencyResolver` - Loads a JS file and figures out the dependencies between the Angular modules within it.
* `LocalResolver` - Looks up the necessary files for a build within the file system.
* `VirtualContext` - Creates a sandboxes environment for executing JS without polluting the global scope. Used internally
by the `DependencyResolver` and `ThemingBuilder`.


#### CLI usage
In order to use the tools through the command line, you have to have installed the module globally
via `npm install -g angular-material-tools`. Now you can create a build at any time by passing any of the above-mentioned
options via command line arguments:

```bash
material-tools --destination ./output --modules list datepicker autocomplete --version 1.0.0
```

##### CLI-specific options
In addition to the options from the Node and TypeScript modules, the CLI has the following options:
* `--help` - Prints out usage information and a list of all the options.
* `--config` or `-c` - Path to a JSON config file to be loaded. If passed, all other options are ignored.
* `-d` or `--dest` - Shorthands for `--destination`.
* `-m` - Shorthand for `--modules`.
* `-v` - Shorthand for `--version`.
* `--verbose` - Logs extra info during the build process. Useful for debugging.
* `--silent` - Silences all build errors and warnings.

#### TypeScript usage
If you're already using TypeScript, you can use the above-mentioned modules directly:
```typescript
import { MaterialTools } from 'angular-material-tools';

let tools = new MaterialTools({
  destination: './output',
  version: '1.0.0',
  modules: ['menu', 'checkbox']
});

tools
  .build()
  .then(files => console.log(files))
  .catch(error => console.error(error));
```

### Output
You will get the following files as a result of the build process:
* `angular-material.js` - Contains the modules that you specified, as well as their dependencies.
* `angular-material.css` - CSS files that has the modules you selected, as well as the layout CSS and core CSS.
* `angular-material.layout-none.css` - Only contains the modules that you selected, in addition to the core structural CSS.
* `angular-material.theme.css` - Your pre-built theme, if it was specified in the options.
* `angular-material.layout.css` and `angular-material.layouts-attributes.css` - Class-based and attribute-based layout CSS.

# angular-material-tools
Build tools for Angular Material

### Quick Links
- [Installation](#installation)
- [CLI Usage](#cli-usage)
- [NodeJS Usage](#nodejs-usage)

### Installation
- `npm install angular-material-tools --save`

### Options

|          Name         	|    Type    |                             Description                                    |
| ----------------------- | ---------- | -------------------------------------------------------------------------- |
| `destination` (*)      	| `string` 	 | Target location for the Material build.                                    |
| `modules`             	| `string[]` | Modules that should be part of the build.<br/> All modules will be built if nothing is specified.                                                                                                          |
| `version`             	| `string`	 | Version of Angular Material.<br/> If set to local, it will take the local installed Angular Material version from the node modules                                                                              |
| `theme`               	| `MdTheme`	 | Palettes, which will be used to generate a static theme stylesheet.        |
| `cache`               	| `string`	 | Directory for caching the downloads                                        |
| `mainFilename`        	| `string` 	 | Name of the entry file that will be loaded to figure out the dependencies. |
| `destinationFilename` 	| `string` 	 | Name to be used as a base for the output files.                            |

**Note:** The options can also be set in a JSON file whose path can be passed to the tools module.

### CLI usage
The build tools also include a CLI, which can be used by installing the tools globally.
- `npm install -g angular-material-tools`

To create a custom Angular Material with the CLI, you can pass the above-mentioned [options](#options) as CLI arguments.

All possible options can be listed in the CLI.
- `material-tools --help`

**Examples**
```bash
material-tools --destination ./output --modules list datepicker autocomplete --version 1.0.0
```

When no version is specified, the CLI will automatically use the installed Angular Material version from the `node modules`.
```bash
material-tools -d ./output -m list
```

#### NodeJS usage
```js
const MaterialTools = require('angular-material-tools');

let tools = new MaterialTools({
  destination: './output',
  version: '1.0.0',
  modules: ['menu', 'checkbox'],
  theme: {
    primaryPalette: 'indigo',
    accentPalette: 'purple',
    warnPalette: 'deep-orange',
    backgroundPalette: 'grey'
  }
});

const successHandler = () => console.log('Build was successful.');
const errorHandler = error => console.error(error);

// Build all of the files.
tools.build().then(successHandler).catch(errorHandler);

// Only build the JS.
tools.buildJS().then(successHandler).catch(errorHandler);

// Only build the theme.
tools.buildTheme().then(successHandler).catch(errorHandler);

// Only build the CSS
tools.buildCSS().then(successHandler).catch(errorHandler);
```

### Output
|                   File                   |                                   Description                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `angular-material.js`                    | Contains the modules that you specified, as well as their dependencies.              |
| `angular-material.css`                   | CSS files that has the modules you selected, as well as the layout CSS and core CSS. |
| `angular-material.layout-none.css`       | Only contains the modules that you selected, in addition to the core structural CSS. |
| `angular-material.theme.css`             | Static generated theme stylesheet, if it was specified in the options.               |
| `angular-material.layouts.css`           | Standalone Layout stylesheet with class selectors                                    |
| `angular-material.layout-attributes.css` | Standalone Layout stylesheet with attribute selectors                                |

## Authors
* [Paul Gschwendtner](https://github.com/DevVersion)
* [Kristiyan Kostadinov](https://github.com/crisbeto)

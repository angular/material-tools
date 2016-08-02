# angular-material-tools [![Build Status](https://travis-ci.org/angular/material-tools.svg?branch=master)](https://travis-ci.org/angular/material-tools)

Tool that generates custom [Angular-Material v1.x](http://github.com/angular/material) builds, consisting of:

*  JS files for a set Material components.
*  CSS for a set of components.
*  Static theme files.
*  Layout CSS, separated from the specific component styling.

> Support for Angular Material v2 may be added in the future.

## Quick Links
- [Installation](#installation)
- [Available Options](#options)
- [CLI Usage](#cli-usage)
- [NodeJS Usage](#nodejs-usage)
- [Theme Building](#theming)
- [Development Environment](#development)

## Installation

- `npm install angular-material-tools --save`

## Usage

`material-tools` can be easily used from the **command-line** or from your own custom **NodeJS** code. The build tools also include a CLI, which can be used by installing the tools globally.
- `npm install -g angular-material-tools`

### Options

|          Name           |    Type     |                             Description                                    |
| ----------------------- | ----------- | -------------------------------------------------------------------------- |
| `destination` (*)       | `string`    | Target location for the Material build.                                    |
| `modules`               | `string[]`  | Modules that should be part of the build.<br/> All modules will be built if nothing is specified.                                                                                                           |
| `version`               | `string`    | Version of Angular Material.<br/> If set to `local`, it will take the local installed Angular Material version from the node modules. <br/> If set to `latest`, the latest version will be downloaded.                                                           |
| `theme`                 | `MdTheme`   | Material Theme to be used to generate a static theme stylesheet.           |
| `themes`                | `MdTheme[]` | Multiple Material Themes, which are used to generated a static stylesheet. |
| `cache`                 | `string`    | Directory for caching the downloads                                        |
| `mainFilename`          | `string`    | Name of the entry file that will be loaded to figure out the dependencies. |
| `destinationFilename`   | `string`    | Name to be used as a base for the output files.                            |

> **Note:** The options can be set in a JSON file whose path can be passed to the CLI or API.


### CLI usage

To create a custom Angular Material build with the command-line interface (CLI), you can pass the [options](#options) as CLI arguments.

All possible options in the CLI can be listed with the command:

  - `material-tools --help`

The CLI includes the following commands:

|                Name                 |              Arguments              |                    Description                 |
| ----------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `<arguments>`                       | Everything from [options](#options) | Default command that builds all files.         |
| `material-tools js <arguments>`     | Everything from [options](#options) | Only builds the JS files.                      |
| `material-tools css <arguments>`    | Everything from [options](#options) | Only builds the CSS files                      |
| `material-tools theme <arguments>`  | Everything from [options](#options) <br/><br/> `--name` <br/> `--primary-palette` <br/> `--accent-palette` <br/> `--warn-palette` <br/> `--background-palette` <br/> `--dark` | Builds the theme files for a single theme. |
| `material-tools themes <arguments>`  | Everything from [options](#options) <br/><br/> `--name` <br/> `--primary-palette` <br/> `--accent-palette` <br/> `--warn-palette` <br/> `--background-palette` <br/> `--dark` | Builds the theme files for an array of themes. |

**Examples**
```bash
material-tools --destination ./output --modules list datepicker autocomplete --version 1.0.0
```

When a version is not specified, the CLI will automatically use the installed Angular Material version from your local `node_modules` directory.
```bash
material-tools -d ./output -m list
```

----

### NodeJS usage

```js
'use strict';

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

tools.build().then(successHandler).catch(errorHandler);         // Build all JS/CSS/themes

tools.build('js').then(successHandler).catch(errorHandler);     // Only build the JS.
tools.build('theme').then(successHandler).catch(errorHandler);  // Only build the theme.
tools.build('css').then(successHandler).catch(errorHandler);    // Only build the CSS

// You can also build a subset of files.
tools.build('css', 'js');   // Builds both the CSS and the JS.
```

**Output**

|                   File                   |                                   Description                                        |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `angular-material.js`                    | Contains the modules that you specified, as well as their dependencies.              |
| `angular-material.css`                   | CSS files that has the modules you selected, as well as the layout CSS and core CSS. |
| `angular-material.layout-none.css`       | Only contains the modules that you selected, in addition to the core structural CSS. |
| `angular-material.themes.css`            | Static generated theme stylesheet, which includes all generated themes.              |
| `angular-material.layouts.css`           | Standalone Layout stylesheet with class selectors                                    |
| `angular-material.layout-attributes.css` | Standalone Layout stylesheet with attribute selectors                                |

----

### Theming
Developers are able to easily build a static theme stylesheet

```js
{
  destination: './myBuild',
  version: '1.1.0-rc.5',
  modules: ['list'],
  theme: {
    primaryPalette: 'blue',
    accentPalette: 'grey'
  }
}
```

In some cases you may want to have multiple themes in your application.
```js
{
  themes: [{
    name: 'firstTheme',
    primaryPalette: 'red'
  }, {
    name: 'secondTheme',
    primaryPalette: 'blue'
  }]
}
```

It is also possible to use [custom palettes](https://material.angularjs.org/latest/Theming/03_configuring_a_theme) for your static theme.

```js
{
  theme: {
    primaryPalette: 'light-orange',
    accentPalette: 'blue'
  },
  palettes: {
    'light-orange': {
      '50': 'FBE9E7',
      '100': 'FFCCBC',
      '200': 'FFAB91',
      '300': 'FF8A65',
      '400': 'FF7043',
      '500': 'FF7043',
      '600': 'F4511E',
      '700': 'E64A19',
      '800': 'D84315',
      '900': 'BF360C',
      'A100': 'FF9E80',
      'A200': 'FF6E40',
      'A400': 'FF3D00',
      'A700': 'DD2C00',
      'contrastDefaultColor': 'light',
      'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100', 'A200'],
      'contrastStrongLightColors': ['500', '600', '700', '800', '900', 'A400', 'A700']
    }
  }
}
```

### Development

If you've cloned the repo, a quick way to explore NodeJS usages is to *directly* run TypeScript without precompiling processes. Developers can use [ts-node](https://github.com/TypeStrong/ts-node) which is installed with:

```bash
# Install a TypeScript compiler (requires `typescript` by default).
npm install -g ts-node typescript
```

Then use the command-line to directly run the `debug.ts` sample from the project root:

```bash
ts-node debug.ts
```

which will generate the output:

```bash
[13:37:00]: Successfully built list, core, animate, layout, gestures, theming, palette,
            datepicker, icon, virtualRepeat, showHide.
```


## Authors
* [Paul Gschwendtner](https://github.com/DevVersion)
* [Kristiyan Kostadinov](https://github.com/crisbeto)

## Architecture 

More insight information about the way `material-tools` works.

#### Quick Links

- [Creating a custom Material Build](#creating-a-custom-material-build)
- [Creating a static theme stylesheet](#creating-a-static-theme-stylesheet)
- [How to run AngularJS in NodeJS](#how-to-run-angularjs-in-nodejs)
- [Why are some files manually compiled](#why-are-some-type-of-files-compiled-manually)
- [Under-the-Hood: Understanding the Virtual Context](#under-the-hood-understanding-the-virtual-context)

### Creating a custom Material Build

Material Tools for AngularJS Material allows developers to build a subset of the
[AngularJS Material](http://www.github.com/angular/material) framework with specific components.

As a developer you could just specify the given
[components](https://github.com/angular/material/tree/master/src/components) and `material-tools` will run
AngularJS Material in the `NodeJS` environment.

> Read more about [running an AngularJS module in NodeJS](#how-to-run-angularjs-in-nodejs)

The tools will then resolve all dependencies of the specified modules and fetch
all required files.

> Some type of files are going to be manually compiled by tools to have more control about the output.<br/>
> Read more [why some files need to be compiled manually](#why-are-some-type-of-files-compiled-manually).

At the end all generated output files will be written to a given folder or can be also accessed from NodeJS 
> Each output file will be also available with `compressed` / `minified` content.<br/>
> Read more about the 
[files, which will be generated](https://github.com/angular/material-tools/tree/docs/architecture-md#output-files)

![Tools Lifecycle](https://cloud.githubusercontent.com/assets/4987015/17671967/0c55b916-631a-11e6-9d79-d99dd50f630a.png)

### Creating a static theme stylesheet

Another great feature of Material Tools for AngularJS Material is the generation of a static theme stylesheet.

You may have noticed that in AngularJS Material the generation of the themes inside of the browser could
damage the performance. Especially storing the generated styles in `<style>` elements in the documents head
is not really efficient. 

> The browser is not able to make any optimizations, and it also takes a while to be able to see the styles in
  action.

This issue can be solved by having a static theme stylesheet.

<img height="250" alt="theme generation flow chart" src="https://cloud.githubusercontent.com/assets/4987015/17679920/f8713b40-633d-11e6-8092-d60e69e8bf86.PNG">


To be able to build a static theme stylesheet the tools need to be able to access the
[`$mdTheming`](https://github.com/angular/material/tree/master/src/core/services/theming) service.

As part of the [Virtual Context](#under-the-hood-understanding-the-virtual-context), we also hook into the
AngularJS prototype to build our own injector, which includes all `services`, `directives`, `providers` and
more.

This allows us to access the `$mdThemingProvider`, which is responsible for configuring the theme.
Once you configure the theme, we instantiate our service by calling the `$get` method of the provider.

After instantiating the `$mdTheming` service we could run the theme generation and hook into the mocked
`document.head` 

The head will contain the generated theme styles as `<style>` elements, which will be extracted then.

### How to run AngularJS in NodeJS

To be able to run an AngularJS module in NodeJS, the tools need to mock a browser environment.

> Material Tools for AngularJS Material only mocks the most necessary parts of the browser.
> This keeps the mock as small as possible.

Material Tools for AngularJS Material assigns this created mock to the global `window` variable.

> NodeJS binds the global `window` variable to `globals`, which is shared between all files.

This can lead to situations, where the tools are interfering with the user's build process.

- The mock is polluting the `globals` of NodeJS.
- The NodeJS [module](https://nodejs.org/api/modules.html) cache will be polluted with wrong exports.

Read more about the way we solved that issue with the
[Virtual Context](#under-the-hood-understanding-the-virtual-context).

### Why are some type of files compiled manually

Some developers are expecting Material Tools for AngularJS Material to export the AngularJS Material
stylesheet without the layouts included by default.

Since the `core` module of AngularJS Material always includes the `layouts` by default, we are not able to
retrieve the `core` module without the `layouts` included.

To work around this issue, we have to manually compile the `core` module with explicitly excluding the
`layout` stylesheets.

### Under-the-Hood: Understanding the Virtual Context

Material Tools for AngularJS Material places a high value on the isolation of the modified NodeJS environment.

The Virtual Context allows the tools to run specific code completely isolated in 
another [V8](https://developers.google.com/v8/) context. <br/>
This not only isolates the given code, it also provides a minimalistic NodeJS environment.

> You can `require` other files from the Virtual Context without leaving the isolated context.

A minimal `require` method has been created inside of the plain V8 context, which supports:
- Nesting of the isolated context
- Creating / Overwriting context global variables (e.g `window`)
- Enabling [strict mode](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Strict_mode)

The Virtual Context plays an important role in Material Tools for AngularJS Material, because it allows us to
completely isolate our changes from the original NodeJS context. It also allows us to overwrite the `globals`,
as mentioned.

Overwriting the `globals` is important when running an AngularJS application in NodeJS.

> That's why the Virtual Context is also responsible for mocking the most necessary parts of a browser to
  run an AngularJS application.

<img alt="graphic showing how the NodeJS context is connected to the virtual context" src="https://cloud.githubusercontent.com/assets/4987015/17678625/2e07fa6a-6338-11e6-9fe6-e6ee54dec53e.png" height="210">

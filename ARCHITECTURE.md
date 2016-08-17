## Architecture 
More insight information about the way `material-tools` works.

#### Quick Links
- [Creating a custom Material Build](#creating-a-custom-material-build)
- [Creating a static theme stylesheet](#creating-a-static-theme-stylesheet)
- [How to run Angular in NodeJS](#how-to-run-angular-in-nodejs)
- [Why are some files manually compiled](#why-are-some-type-of-files-compiled-manually)
- [Under-the-Hood: Understanding the Virtual Context](#under-the-hood-understanding-the-virtual-context)

### Creating a custom Material Build
Material Tools allows developers to build a subset of the [Angular Material 1.x](http://www.github.com/angular/material) framework with specific components.

As a developer you could just specifiy the given [components](https://github.com/angular/material/tree/master/src/components) 
and `material-tools` will run Angular Material in the `NodeJS` environment.

> Read more about [running an Angular module in NodeJS](#how-to-run-angular-in-nodejs)

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
Another great feature of Material Tools is the generation of a static theme stylesheet.

You may have noticed that in Angular Material the generation of the themes inside of the browser could damage the performance.
Especially storing the generated styles in `<style>` elements in the documents head is not really efficient. 

> The browser is not able to make any optimizations and it also takes a while to be able to see the styles in action.

This issue can be easily solved by having a static theme stylesheet.

<img height="250" src="https://cloud.githubusercontent.com/assets/4987015/17679920/f8713b40-633d-11e6-8092-d60e69e8bf86.PNG">


To be able to build a static theme stylesheet the tools need to be able to access the [`$mdTheming`](https://github.com/angular/material/tree/master/src/core/services/theming) service.

As part of the [Virtual Context](#under-the-hood-understanding-the-virtual-context), we also hook into the AngularJS prototype to build our own injector, which includes all `services`, `directives`, `providers` and more.

This allows us to access the `$mdThemingProvider`, which is responsible for configurating the theme.
Once the theme is configured we instantiate our service by calling the `$get` method of the provider.

After instantiating the `$mdTheming` service we could run the theme generation and hook into the mocked `document.head` 

The head will contain the generated theme styles as `<style>` elements, which will be extraced then.

### How to run Angular in NodeJS

To be able to run an Angular module in NodeJS the tools need to mock a browser environment.

> Material Tools does only mock the most necessary parts of the browser so the mock is as small as possible.

This created mock will then be assigned to the global `window` variable.
> The global `window` variable is bound to the NodeJS `globals`, which is shared between all files.

This can lead to situations, where the tools are interfering with the user's build process.

- The mock is polluting the `globals` of NodeJS.
- The NodeJS [module](https://nodejs.org/api/modules.html) cache will be polluted with wrong exports.

Read more about the way we solved that issue with the [Virtual Context](#under-the-hood-understanding-the-virtual-context)

### Why are some type of files compiled manually

Some developers are expecting Material Tools to export the Angular Material stylesheet without the layouts included by default.

Since the `core` module of Angular Material always includes the `layouts` by default, we are not able to retrieve the `core` module
without the `layouts` included.

To work around this issue, we have to manually compile the `core` module with explicitly excluding the `layout` stylesheets.

### Under-the-Hood: Understanding the Virtual Context
Material Tools places a high value on on the isolation of the modified NodeJS environment.

The Virtual Context allows the tools to run specific code completely isolated in 
another [V8](https://developers.google.com/v8/) context. <br/>
It is not only isolating the given code. It also provides a minimalistic NodeJS environment.

> It is also possible to require other files from the Virtual Context without leaving the isolated context.<br/>

A minimal `require` method has been created inside of the plain V8 context, which supports:
- Nesting of the isolated context
- Creating / Overwriting context global variables (e.g `window`)
- Enabling [strict mode](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Strict_mode)

It plays such a big role in Material Tools, because it allows us to completely isolate our changes from the original NodeJS context
and also allows us to overwrite the `globals` as mentioned previously.

The overwriting of the `globals` is important to be able to run an Angular application in NodeJS.

> That's why the Virtual Context is also responsible for mocking the most necessary parts of a browser to run an Angular application.

<img src="https://cloud.githubusercontent.com/assets/4987015/17678625/2e07fa6a-6338-11e6-9fe6-e6ee54dec53e.png" height="210">

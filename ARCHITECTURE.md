## Architecture 
More insight information about the way `material-tools` works.

#### Quick Links
- [How does it work](#how-does-it-work)
- [How to run Angular in NodeJS](#how-to-run-angular-in-nodejs)
- [Why are some files manually compiled](#why-are-some-type-of-files-compiled-manually) 
- [Virtual Context](#virtual-context)

### How does it work
Material Tools allows developers to build a custom version of [Angular Material 1.x](http://www.github.com/angular/material).

As a developer you could just specifiy the given [components](https://github.com/angular/material/tree/master/src/components) 
and `material-tools` will run Angular Material in the `NodeJS` environment.

> Read more about [running an Angular module in NodeJS](#how-to-run-angular-in-nodejs)

The tools will then resolve all dependencies of the specified modules and fetch
all required files.

> Some type of files are going to be manually compiled by tools to have more control about the output.<br/>
> Read more [why some files need to be compiled manually](#why-are-some-type-of-files-compiled-manually).

At the end all generated output files will be written to a given folder or can be also accessed from NodeJS 
> Each output file will be also available with `compressed` / `minified` content.

<img src="https://cloud.githubusercontent.com/assets/4987015/17671967/0c55b916-631a-11e6-9d79-d99dd50f630a.png">

### How to run Angular in NodeJS

To be able to run an Angular module in NodeJS the tools need to mock a browser environment.

> Material Tools does only mock the most necessary parts of the browser so the mock is as small as possible.

This mock will be applied to the global `window` variable, which is normally used by a browser.<br/>
The global `window` variable is then bound to the NodeJS `globals`, which is shared between all files.

This can lead to situations, where the tools are interfering with the users build process.

- The mock is polutting the `globals` of NodeJS.
- The NodeJS [module](https://nodejs.org/api/modules.html) cache will be polluted with wrong exports.

Read more how we solved that issue with the [Virtual Context](#virtual-context)

### Why are some type of files compiled manually

Some developers are expecting Material Tools to export the Angular Material stylesheet without the layouts included by default.

Since the `core` module of Angular Material always includes the `layouts` by default, we are not able to retrieve the `core` module
without the `layouts` included.

To work around this issue, we have to manually compile the `core` module with explicitly excluding the `layout` stylesheets.

### Virtual Context
Material Tools places a high value on o the isolation of the modified NodeJS environment.

The Virtual Context allows the tools to run specific code completely isolated in 
another [V8](https://developers.google.com/v8/) context. <br/>
It is not only isolating the given code. It also provides a minimistic NodeJS environment.

> It is also possible to require other files from the Virtual Context without leaving the isolated context.<br/>

A minimal `require` method has been created inside of the plain V8 context, which supports:
- Nesting of the isolated context
- Overwriting and nesting of the context `globals`.

It plays such a big role in Material Tools, because it allows us to completely isolate our changes from the original NodeJS context
and also allows us to overwrite the `globals` as mentioned previously.

The overwriting of the `globals` is important to be able to run an Angular application in NodeJS.<br/>
> That's why the Virtual Context is also responsible for mocking the most necessary parts of a browser to run an Angular application.


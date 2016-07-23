'use strict';

const glob = require('glob').sync;
const fse = require('fs-extra');
const path = require('path');
const ts = require('typescript');

const buildConfig = require('../build.json');

// We run the Typescript Compiler from the node modules because we want to be consistent
// with the compiler version.
const TSC_BIN = './node_modules/typescript/bin/tsc';
const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIRECTORY = path.resolve(PROJECT_ROOT, buildConfig.outDir);

buildConfig.copyFiles.forEach(pattern => {
  let files = glob(pattern, { cwd: PROJECT_ROOT });

  files.forEach(file => {
    fse.copySync(path.join(PROJECT_ROOT, file), path.join(OUTPUT_DIRECTORY, file));
  });
});

// Retrieve all source files.
let sourceFiles = buildConfig.tsFiles
  .map(pattern => glob(pattern, { cwd: PROJECT_ROOT }))
  .reduce((array, item) => array.concat(item), []);

/**
 * TypeScript Compilation with Language Service.
 */
let tsProject = ts.convertCompilerOptionsFromJson(require('../tsconfig.json').compilerOptions);
let tsProgram = ts.createProgram(sourceFiles, tsProject.options);
let emitResult = tsProgram.emit();

let compileErrors = ts.getPreEmitDiagnostics(tsProgram).concat(emitResult.diagnostics);

compileErrors.forEach(diagnostic => {
  let lineResults = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
  let errorMessage = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
  console.error(`${diagnostic.file.fileName}@${lineResults.line + 1}: ${errorMessage}`);
});

if (emitResult.emitSkipped) {
  console.error('Build: An error occurred while compiling the project.');
  process.exit(1);
} else {
  console.log(`Build: Successfully compiled the project.`);
}
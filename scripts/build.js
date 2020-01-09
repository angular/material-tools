'use strict';

const glob = require('glob').sync;
const fse = require('fs-extra');
const path = require('path');
const ts = require('typescript');

const BUILD_CONFIG = require('../build.json');
const PROJECT_ROOT = path.join(__dirname, '..');
const OUTPUT_DIRECTORY = path.resolve(PROJECT_ROOT, BUILD_CONFIG.outDir);

BUILD_CONFIG.copyFiles.forEach(pattern => {
  let files = glob(pattern, { cwd: PROJECT_ROOT });

  files.forEach(file => {
    fse.copySync(path.join(PROJECT_ROOT, file), path.join(OUTPUT_DIRECTORY, file));
  });
});

// Retrieve all source files.
let sourceFiles = BUILD_CONFIG.tsFiles
  .map(pattern => glob(pattern, { cwd: PROJECT_ROOT }))
  .reduce((array, item) => array.concat(item), [])
  .map(file => path.join(PROJECT_ROOT, file));

/**
 * TypeScript Compilation with Language Service.
 */
let compilerOptions = require('../tsconfig.json').compilerOptions;
let tsProject = ts.convertCompilerOptionsFromJson(compilerOptions);

// Overwrite several options to properly output the distribution files.
tsProject.options.rootDir = PROJECT_ROOT;
tsProject.options.outDir = OUTPUT_DIRECTORY;

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

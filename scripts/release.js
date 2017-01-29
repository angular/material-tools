'use strict';

const pkg = require('../package.json');
const fse = require('fs-extra');
const config = require('../build.json');
const chalk = require('chalk');
const spawn = require('child_process').spawnSync;
const exec = require('child_process').execSync;
const path = require('path');
const readline = require('readline-sync');

process.chdir(__dirname);

const ROOT = path.resolve('..');
const AUTHORIZED = ['angularcore', 'crisbeto', 'devversion'];
const OUT_DIR = path.join(ROOT, config.outDir);

// Initialization
showHeader();

if (isAuthorized() && checkBranch()) {
  init();
}

function init() {
  let latestTag = getLatestTag();
  let proposedVersion = incrementVersion(pkg.version);

  log(`- Current Version: ${pkg.version}`);
  log(`- Latest Tag: ${latestTag || 'None'}`);
  log();

  log('Please specify the new version to be released.');
  let version = prompt(`Version (${proposedVersion}):`) || proposedVersion;

  log();
  info(`> Creating release for v${version}...`);

  if (pkg.version !== version) {
    updateVersion(version);
    createCommit(`release(): publish v${version}`, ['package.json']);

    info('> Updated version inside of package.json');
  } else {
    info('> Keeping existing version inside of package.json');
  }

  fse.removeSync(OUT_DIR);
  info('> Deleted distribution folder.');

  let hasBuilt = buildDistribution();

  if (!hasBuilt) {
    log();
    error('An error occurred while building the source files.');
    return;
  } else {
    info('> Successfully built the source files.');
  }

  copyFiles(['README.md']);
  info('> Copied project description into distribution folder.');

  if (tagRelease(version)) {
    info('> Created git tag for new version.');
  } else {
    log();
    error('An error occurred while tagging the new version.');
    return;
  }

  success('> Successfully built a release.');
  log();

  let shouldPublish = prompt('Do you want to publish the new version to NPM? (yes)') === 'yes';

  if (shouldPublish) {
    info('> Publishing to NPM...');

    if (publishPackage()) {
      success('> Successfully published package to NPM.');
    } else {
      error('An error occurred while publishing to NPM');
    }
  }

  log();
  info('> Exiting the release script... Bye!');
}

function isAuthorized() {
  if (AUTHORIZED.indexOf(exec('npm whoami').toString().trim()) === -1) {
    error(
      'You must be authenticated with one of the following NPM accounts: \n' +
      '- ' + AUTHORIZED.join('\n- ')
    );
  } else {
    return true;
  }
}

function checkBranch() {
  let branchName = exec('git rev-parse --abbrev-ref HEAD').toString().trim();

  if (branchName !== 'master') {
    error('When creating a release, you must be on the `master` branch.');
  } else {
    return true;
  }
}

function getLatestTag() {
  let latestSHA = spawn('git', ['rev-list', '--tags', '--max-count=1']).stdout.toString().trim();
  return spawn('git', ['describe', '--tags', latestSHA]).stdout.toString().trim();
}

function incrementVersion(version) {

  let digits = version.split('.').map(digit => {
    return /^\d+$/.test(digit) ? parseInt(digit) : digit;
  });

  let index = digits.length - 1;

  while (index !== -1) {
    let currentIndex = index;
    let currentDigit = digits[currentIndex];

    if (typeof currentDigit !== 'number') {
      index--;
      continue;
    }

    // Increase the digit for the next version.
    currentDigit++;

    if (currentDigit > 9) {
      currentDigit = 0;
      index--;
    } else {
      index = -1;
    }

    // Update the changed digit.
    digits[currentIndex] = currentDigit;
  }

  return digits.join('.');
}

function tagRelease(newVersion) {
  let result = spawn('git', ['tag', `v${newVersion}`, '-f']);
  return !result.stderr.toString().trim();
}

function updateVersion(newVersion) {
  pkg.version = newVersion;
  fse.writeFileSync('../package.json', JSON.stringify(pkg, null, 2));
}

function publishPackage() {
  let result = exec('npm publish', {
    cwd: path.join(ROOT, config.outDir)
  }).toString().toLowerCase().trim();

  // Due to https://github.com/nodejs/node-v0.x-archive/issues/2318
  // we can't take advantage of spawnSync and read the exitCode.
  return result.indexOf('failed') === -1;
}

function buildDistribution() {
  let result = spawn('node', ['./build.js']);
  return !result.stderr.toString().trim();
}

function copyFiles(files) {
  files.forEach(file => {
    fse.copySync(path.join(ROOT, file), path.join(OUT_DIR, file))
  })
}

function createCommit(message, files) {
  files.forEach(file => {
    exec(`git add ${file}`, { cwd: ROOT });
  });

  return exec(`git commit -m "${message}"`, { cwd: ROOT }).toString();
}

function showHeader() {
  log(line('-'));
  log(chalk.yellow(center(('Material-Tools Release'))));
  log(line('-'));
}

function prompt(question) {
  return readline.question(question + ' ');
}

function log(message) {
  console.log(message || '')
}

function success(message) {
  console.log(chalk.green(message || ''));
}

function info(message) {
  console.log(chalk.grey(message));
}

function error(message) {
  console.error(chalk.red(message));
}

function center(message, columns) {
  let rest = (columns || 50) - message.length;
  for (let i = 0; i < (rest / 2); i++) {
    message = ' ' + message + ' ';
  }
  return message;
}

function line(message, columns) {
  let output = message;
  let rest = (columns || 50) - message.length;
  for (let i = 0; i < rest; i++) {
    output += message;
  }
  return output;
}
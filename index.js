const core = require('@actions/core');
const simpleGit = require('simple-git/promise');
const git = simpleGit();

const {
  promises: { readdir, copyFile },
  readFileSync,
  writeFileSync,
} = require('fs');
const { join } = require('path');

const mainDirectory = '.';

const license = 'LICENSE';
let directoryFiles = [];
let licenseFile = '';

async function checkLicense() {
  directoryFiles = await readdir(mainDirectory);
  directoryFiles.forEach((file) => {
    if (file.toLowerCase() === 'license' || file.toLowerCase() === 'license.md')
      return core.info('Unable to Create License. License Available');
    process.exit();
  });
}

async function createLicense(licenseType) {
  // Check For License Type
  async function checkLicenseType() {
    switch (licenseType) {
      case 'AGPL':
        licenseFile = 'agpl-3.0.txt';
        break;
      case 'Apache':
        licenseFile = 'apache-2.0.txt';
        break;
      case 'BSD':
        licenseFile = 'bsd-3.0.txt';
        break;
      case 'CC-BY':
        licenseFile = 'cc-by-4.0.txt';
        break;
      case 'CC-BY-NC':
        licenseFile = 'cc-by-nc-4.0.txt';
        break;
      case 'CC-BY-NC-SA':
        licenseFile = 'cc-by-nc-sa-4.0.txt';
        break;
      case 'CC-BY-SA':
        licenseFile = 'cc-by-sa-4.0.txt';
        break;
      case 'CC0':
        licenseFile = 'cc-zero-1.0.txt';
        break;
      case 'GPL':
        licenseFile = 'gpl-3.0.txt';
        break;
      case 'LGPL':
        licenseFile = 'lgpl-3.0.txt';
        break;
      case 'MIT':
        licenseFile = 'mit.txt';
        break;
      case 'MPL':
        licenseFile = 'mpl-2.0.txt';
        break;
      case 'Unlicense':
        licenseFile = 'unlicense.txt';
        break;
    }
  }

  await checkLicenseType();

  // Copy Text File
  await copyFile(
    join(__dirname, `files/${licenseFile}`),
    join(mainDirectory, license),
    (err) => {
      if (err) throw err;
    }
  );
}

async function replaceVariables() {
  let data = readFileSync(license, 'utf-8');
  let author = data.replace(/{AUTHOR}/gim, core.getInput('AUTHOR'));
  writeFileSync(license, author, 'utf-8');

  let data1 = readFileSync(license, 'utf-8');
  let year = data1.replace(/{YEAR}/gim, new Date().getFullYear());
  writeFileSync(license, year, 'utf-8');

  let data2 = readFileSync(license, 'utf-8');
  let projectName = data2.replace(
    /{PROJECT_NAME}/gim,
    core.getInput('PROJECT_NAME')
  );
  writeFileSync(license, projectName, 'utf-8');
}

async function commitFile() {
  await git.add('./*');
  await git.addConfig('user.name', process.env.GITHUB_ACTOR);
  await git.addConfig('user.email', process.env.GIT_EMAIL);
  await git.commit(
    '📝 Added License via https://github.com/dephraiim/license-action'
  );
  await git.push();
}

async function run() {
  try {
    const license = core.getInput('LICENSE_TYPE');

    // Check If license is present
    await checkLicense();
    core.info(`Creating ${license} license ...`);

    // Create License if license is not present
    await createLicense(license);
    core.info(`${core.getInput('LICENSE_TYPE')} License Copied`);

    // Replace Name, Project and Year Variable
    await replaceVariables();
    core.info('License Info Added');

    // Commit License with Commit Message
    await commitFile();
    core.info('License Commit Complete.');

    core.info(`Created ${license} license!`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

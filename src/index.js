const core = require('@actions/core');
const github = require('@actions/github');
const {
  promises: { readdir, rename, copyFile, readFile, writeFile },
} = require('fs');
const { join } = require('path');
const token = process.env.GITHUB_TOKEN;
const octokit = github.getOctokit(token);
const repoInfo = github.context.repo;

const mainDirectory = process.env['GITHUB_WORKSPACE'];

const license = 'LICENSE';
let directoryFiles = [];
let licenseFile = '';

async function checkLicense() {
  directoryFiles = await readdir(mainDirectory);
  directoryFiles.forEach((file) => {
    if (file.toLowerCase() === 'license' || file.toLowerCase() === 'license.md')
      throw new Error('Unable to Create License. License Available');
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
    mainDirectory,
    (err) => {
      if (err) throw err;
    }
  );

  // Rename Text File
  await rename(
    join(__dirname, licenseFile),
    join(__dirname, license),
    (err) => {
      if (err) throw err;
    }
  );
}

async function replaceVariables() {
  readFile(license, 'utf-8', (err, data) => {
    if (err) throw err;

    let author = data.replace(/{AUTHOR}/gim, core.getInput('AUTHOR'));
    let year = data.replace(/{YEAR}/gim, new Date().getFullYear());

    writeFile(license, author, 'utf-8', function (err) {
      if (err) throw err;
      core.info('License Author Added');
    });

    writeFile(license, year, 'utf-8', function (err) {
      if (err) throw err;
      core.info('License Year Added');
    });

    if (core.getInput('PROJECT_NAME')) {
      let projectName = data.replace(
        /{PROJECT_NAME}/gim,
        core.getInput('PROJECT_NAME')
      );
      writeFile(license, projectName, 'utf-8', function (err) {
        if (err) throw err;
        core.info('License Project Name Added');
      });
    }
  });
}

async function commitFile() {
  const blob = await octokit.git.createBlob({
    ...repoInfo,
    content: readFile('./LICENSE', (err, data) => {
      if (err) throw err;
      return data.toString('base64');
    }),
    encoding: 'base64',
  });
  const heads = await octokit.git.listRefs({
    ...repoInfo,
    namespace: 'heads/',
  });

  for (let head of heads.data) {
    const headCommit = await octokit.git.getCommit({
      ...repoInfo,
      commit_sha: head.object.sha,
    });
    let tree = await octokit.git.getTree({
      ...repoInfo,
      tree_sha: headCommit.data.tree.sha,
    });

    const handleObjects = async (objects) => {
      for (let object of objects) {
        core.debug(`  Caginating ${object.path}`);
        if (object.type == 'tree' && object.path == './LICENSE') {
          const innerTree = await octokit.git.getTree({
            ...repoInfo,
            tree_sha: object.sha,
          });
          const newTree = await handleObjects(innerTree.data.tree);
          object.sha = newTree.data.sha;
        } else if (object.type == 'blob') {
          object.sha = blob.data.sha;
        }
      }
      return octokit.git.createTree({ ...repoInfo, tree: objects });
    };

    const newTree = await handleObjects(tree.data.tree);
    const newCommit = await octokit.git.createCommit({
      ...repoInfo,
      tree: newTree.data.sha,
      message: '📝 Added License via dephraiim/license-action',
      parents: [headCommit.data.sha],
    });
    await octokit.git.updateRef({
      ...repoInfo,
      ref: head.ref.substr(5),
      sha: newCommit.data.sha,
    });
  }
}

async function run() {
  try {
    const license = core.getInput('LICENSE_TYPE');
    core.info(`Creating ${license} license ...`);

    // Check If license is present
    await checkLicense();

    // Create License if license is not present
    await createLicense(license);

    // Replace Name, Project and Year Variable
    await replaceVariables();

    // Commit License with Commit Message
    await commitFile();

    core.info(`Created ${license} license!`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

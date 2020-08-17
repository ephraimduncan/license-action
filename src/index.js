const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  try {
    const license = core.getInput('LICENSE_TYPE');
    core.info(`Creating ${license} license ...`);

    // core.debug(new Date().toTimeString()); // debug is only output if you set the secret `ACTIONS_RUNNER_DEBUG` to true
    core.info(new Date().toTimeString());
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

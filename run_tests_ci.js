const request = require('request-promise').defaults({
  simple: false,
  resolveWithFullResponse: true,
  json: true
});
const run_tests = require('./run_tests');

const GITHUB_BASE = 'https://api.github.com';
const GITHUB_HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'learn.javascript.ru',
};

if (!process.env.CIRCLECI)
  throw new Error('run_tests_ci can be run only on CI');

if (!process.env.CIRCLE_PR_NUMBER) {
  console.log({
    skip: true,
  });
  process.exit(0);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retrievePRInfo() {
  const owner = process.env.CIRCLE_PROJECT_USERNAME;
  const repo_name = process.env.CIRCLE_PROJECT_REPONAME;
  const number = process.env.CIRCLE_PR_NUMBER;

  const response = await request({
    uri: `${GITHUB_BASE}/repos/${owner}/${repo_name}/pulls/${number}`,
    headers: GITHUB_HEADERS,
    method: 'GET'
  });

  if (response.statusCode === 403) {
    await sleep(300);
    return retrievePRInfo();
  }

  if (!response.body.title) {
    console.error(response.body.message);
    process.exit(1);
  }

  const moduleName = response.body.title.match(/\d+-module/i) || [];
  const taskName = response.body.title.match(/\d+-task/i) || [];

  return [moduleName[0], taskName[0]];
}

retrievePRInfo()
  .then(([moduleName, taskName]) => {
    run_tests(moduleName, taskName, { reporter: 'json', useColors: false, });
  })
  .catch(err => {
    console.error(err.message);
    process.exit(1);
  });

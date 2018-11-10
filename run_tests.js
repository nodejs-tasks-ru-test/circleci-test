const Mocha = require('mocha');
const glob = require('glob');
const fs = require('fs');

module.exports = function runTests(moduleName, taskName, options) {
  if (!moduleName) {
    fs.writeFileSync('results/result.json', JSON.stringify({
      format_error: true,
      message: 'Required parameter `moduleName` is missing. Example: `npm test 0-module 1-task`'
    }));
    process.exit(1);
  }

  if (!taskName) {
    fs.writeFileSync('results/result.json', JSON.stringify({
      format_error: true,
      message: 'Required parameter `taskName` is missing. Example: `npm test 0-module 1-task`'
    }));
    process.exit(1);
  }

  const tests = glob.sync(`${moduleName}/${taskName}/test/**/**.test.js`);

  if (tests.length === 0) {
    fs.writeFileSync('results/result.json', JSON.stringify({
      format_error: true,
      message: `There are no test files in ${moduleName}/${taskName}. Please check module and task.`
    }));
    process.exit(1);
  }

  const mocha = new Mocha(options);

  tests.forEach(test => mocha.addFile(test));

  mocha.run(failures => {
    process.exitCode = (failures ? 1 : 0);
  });
};

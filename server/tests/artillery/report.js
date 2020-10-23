const chalk = require('chalk');
var logURL = false;

if (process.env.NAME) {
  console.log('');
  console.log(chalk.bold.black.underline(process.env.NAME));  
}

if (process.env.TYPE === 'DB') {
  var lines = (process.env.DATA || '').split('\n');
  for (var index = 0; index < lines.length; index++) {
    var line = lines[index];
    if (line.indexOf('MongoDB shell version:') === 0) continue;
    if (line.indexOf('switched to db') === 0) continue;
    if (line.indexOf('connecting to:') === 0) continue;
    if (line.indexOf('WriteResult(') === 0) continue;
    if (line.indexOf('bye') === 0) continue;
    console.log(chalk.blue(line));
  }
}

if (process.env.TYPE === 'TEST') {
  var lines = (process.env.DATA || '').split('\n');
  for (var index = 0; index < lines.length; index++) {
    var line = lines[index];
    try {
      var tests = JSON.parse(line);
    } catch (error) {
      if (line.indexOf('  ** ') === 0) continue;
      try {
        line = line.toString();
      } catch (error) {
        // do nother
      }
      console.log(chalk.dim(line));
      continue;
    }
    var allGood = true;
    var results = tests.results || [];
    // if results is empty, check the ok prop of the tests
    if (results.length === 0 && tests.ok === false) {
      console.log(chalk.red('[not ok]'), chalk.red('Error'), tests.error);
      continue;
    } else if (results.length === 0 && tests.ok === true) {
      console.log(chalk.green('[ok]'), tests.name);
    }
    for (var k = 0; k < results.length; k++) {
      var result = results[k];
      if (!result.ok) {
        allGood = false;
      }
    }

    if (allGood) {
      console.log(chalk.green(' [ok]'), tests.name, 'passed', chalk.blue(results.length, 'tests'));
      if (logURL) console.log('       ', tests.url);
    } else {
      console.log(' ', chalk.red(tests.name, 'did not passed all tests'));
      for (var k = 0; k < results.length; k++) {
        var result = results[k];
        console.log(' ', result.ok ? chalk.green('[ok]'):chalk.red('[not ok]'), result.type);
        if (!result.ok) {
          try {
            result = JSON.stringify(result, null, 2);
          } catch (e) {
            try {
              result = result.toString();
            } catch (e) {
              // do nothing
            }
          }
          console.log(chalk.red(result));
        }
      }
    }

  }


  // console.log('DATA', process.env.DATA);
  // var tests = JSON.parse(process.env.DATA);
  // console.log(JSON.stringify(tests, null, 2));
}
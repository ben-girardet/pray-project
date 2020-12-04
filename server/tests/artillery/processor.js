'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = {
  logResponse: logResponse,
  uploadImage: uploadImage,
  saveTokens: saveTokens,
  getTokens: getTokens,
};

function logResponse(context, ee, done) {
  console.log(chalk.dim('  -- Response -- '));
  console.log(chalk.dim(JSON.stringify(context.vars.response, null, 2)));
  done();
}

function uploadImage(requestParams, context, ee, next) {
  var formData = {
    file: fs.createReadStream(path.join(__dirname, './_data/image.jpg')),
  };
  requestParams.formData = Object.assign({}, requestParams.formData, formData);
  next();
}

function saveTokens(context, ee, done) {
    var fileContent = context.vars.benToken + "\n" + context.vars.chantalToken + "\n" + context.vars.thomasToken;
    fs.writeFileSync(path.resolve(__dirname, './_data/tokens.txt'), fileContent, 'utf8');
    done();
}

function getTokens(context, ee, done) {
    var fileContent = fs.readFileSync(path.resolve(__dirname, './_data/tokens.txt'), {encoding: 'utf-8'});
    var tokens = fileContent.split("\n");
    context.vars.benToken = tokens[0];
    context.vars.chantalToken = tokens[1];
    context.vars.thomasToken = tokens[2];
    done();
}

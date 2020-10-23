'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

module.exports = {
  logResponse: logResponse,
  uploadImage: uploadImage
};

function logResponse(context, ee, done) {
  console.log(chalk.dim('  -- Response -- '));
  console.log(chalk.dim(JSON.stringify(context.vars.response, null, 2)));
  done();
}

function uploadImage(requestParams, context, ee, next) {
    console.log('uploadImage')
  var formData = {
    file: fs.createReadStream(path.join(__dirname, './_data/image.jpg')),
  };
  requestParams.formData = Object.assign({}, requestParams.formData, formData);
  next();

}

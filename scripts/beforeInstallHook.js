#!/usr/bin/env node

var path = require('path'),
    url = require('url'),
    fs = require('fs'),
    copyFiles = require('./copyFiles'),
    logger = require('./logger'),
    Q;

module.exports = function (context) {
  var projectRoot = context.opts.projectRoot;

  // if the windows folder does not exist, cancell the script
  var windowsPath = path.join(projectRoot, 'platforms','windows');
  if (!fs.existsSync(windowsPath) || context.opts.plugin.platform !== 'windows') {
    return;
  }

  Q = context.requireCordovaModule('q');
  var task = Q.defer();

  // move contents of the assets folder to the windows platform dir
  var sourcePath = path.join(windowsPath, 'CordovaApp.projitems');
  var destPath = path.join(windowsPath, 'CordovaApp.projitems.xml');
  logger.log('Adding WinJS to the solution.');
  logger.log('Temporarily renaming the CordovaApp.projitems file to CordovaApp.projitems.xml.');

  copyFiles(sourcePath, destPath, function (err) {
    if (err) {
      logger.error(err);
      return task.reject();
    }

    return task.resolve();
  });

  return task.promise;
};

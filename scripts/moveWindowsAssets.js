#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    copyFiles = require('./copyFiles'),
    logger = require('./logger'),
    Q;

module.exports = function (context) {
  var projectRoot = context.opts.projectRoot;

  // if the windows folder does not exist, cancell the script
  var windowsPath = path.join(projectRoot, "platforms","windows");
  if (!fs.existsSync(windowsPath)) {
    return;
  }

  Q = context.requireCordovaModule('q');
  var task = Q.defer();

  // move contents of the assets folder to the windows platform dir
  var sourcePath = path.resolve(__dirname, "..", "assets\\windows\\css");
  var destPath = path.resolve(__dirname, "..", "..", "..", "platforms\\windows\\www\\css");
  logger.log('Moving css assets for the windows platform.');

  copyFiles(sourcePath, destPath, function (err) {
    if (err) {
      console.error(err);
      return task.reject();
    }

    console.log("Finished copying css assets for the windows platform.");

    sourcePath = path.resolve(__dirname, "..", "assets\\windows\\images");
    destPath = path.resolve(__dirname, "..", "..", "..", "platforms\\windows\\www\\images");
    logger.log('Moving image assets for the windows platform');

    copyFiles(sourcePath, destPath, function (err) {
      if (err) {
        console.error(err);
        return task.reject();
      }

      console.log("Finished copying image assets for the windows platform.");

      sourcePath = path.resolve(__dirname, "..", "assets\\windows\\js");
      destPath = path.resolve(__dirname, "..", "..", "..", "platforms\\windows\\www\\js");

      copyFiles(sourcePath, destPath, function (err) {
        if (err) {
          console.error(err);
          return task.reject();
        }

        console.log("Finished copying js assets for the windows platform.");

        sourcePath = path.resolve(__dirname, "..", "assets\\windows\\html");
        destPath = path.resolve(__dirname, "..", "..", "..", "platforms\\windows\\www");

        copyFiles(sourcePath, destPath, function (err) {
          if (err) {
            console.error(err);
            return task.reject();
          }

          console.log("Finished copying html assets for the windows platform.");

          return task.resolve();
        });
      });
    });
  });

  return task.promise;
};

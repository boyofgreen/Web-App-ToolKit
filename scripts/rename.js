var fs = require('fs'),
    copyFiles = require('./copyFiles');

function rename(sourcePath, destPath, callback) {
  copyFiles(sourcePath, destPath, function (err) {
    if (err) {
      callback(err);
    }

    fs.unlink(sourcePath, function (err) {
      if (err) {
        callback(err);
      }

      callback();
    });
  });
}


module.exports = rename;

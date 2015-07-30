#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    currentPath,
    targetPath,
    Q;

var logger = {
  log: function () {
    if (process.env.NODE_ENV !== 'test') {
      console.log.apply(this, arguments)
    }
  },
  warn: function() {
    if (process.env.NODE_ENV !== 'test') {
      console.warn.apply(this, arguments)
    }
  }
};


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
  var sourcePath = path.join(windowsPath, 'CordovaApp.projitems');
  var destPath = path.join(windowsPath, 'CordovaApp.projitems.xml');
  logger.log('Renaming the CordovaApp.projitems file to CordovaApp.projitems.xml.');

  copyAssets(sourcePath, destPath, function (err) {
    if (err) {
      console.error(err);
      return task.reject();
    }

    console.log("Finished copyin the CordovaApp.projitems.");

    fs.unlink(sourcePath, function (err) {
      if (err) {
        console.error(err);
        return task.reject();
      }

      console.log("Finished renaming the CordovaApp.projitems.");

      return task.resolve();
    });
  });

  return task.promise;
};

function copyAssets (source, dest, callback) {
  var basePath = process.cwd(),
      currentPath = path.resolve(basePath, source),
      targetPath = path.resolve(basePath, dest),
      replace = true,

      errs = null,
      started = 0,
      finished = 0,
      running = 0,
      limit = 16;

  startCopy(currentPath);

  function startCopy(source) {
    started++;
    return getStats(source);
  }

  function getStats(source) {
    var stat = fs.lstat;
    if (running >= limit) {
      return setImmediate(function () {
        getStats(source);
      });
    }
    running++;
    stat(source, function (err, stats) {
      var item = {};
      if (err) {
        return onError(err);
      }

      item.name = source;
      item.mode = stats.mode;

      if (stats.isFile()) {
        return onFile(item);
      }
    });
  }

  function onFile(file) {
    var target = file.name.replace(currentPath, targetPath);

    isWritable(target, function (writable) {
      if (writable) {
        return copyFile(file, target);
      }
      if(replace) {
        rmFile(target, function () {
          copyFile(file, target);
        });
      }
      else {
        return cb();
      }
    });
  }

  function copyFile(file, target) {
    var readStream = fs.createReadStream(file.name),
        writeStream = fs.createWriteStream(target, { mode: file.mode });

    readStream.on('error', onError);
    writeStream.on('error', onError);

      writeStream.on('open', function() {
        readStream.pipe(writeStream);
      });

    writeStream.once('finish', function() {
        cb();
    });
  }

  function isWritable(path, done) {
    fs.lstat(path, function (err) {
      if (err) {
        if (err.code === 'ENOENT') return done(true);
        return done(false);
      }
      return done(false);
    });
  }

  function onError(err) {
    if (!errs) {
      errs = [];
    }

    if (typeof errs.write === 'undefined') {
      if (err) {
        errs.push(err);
      }
    } else {
      if (err && err.stack) {
        errs.write(err.stack + '\n\n');
      }
    }
    return cb();
  }

  function cb(skipped) {
    if (!skipped) running--;
    finished++;
    if ((started === finished) && (running === 0)) {
      if (callback !== undefined ) {
        return errs ? callback(errs) : callback(null);
      }
    }
  }

  function rmFile(file, done) {
    fs.unlink(file, function (err) {
      if (err) {
        return onError(err);
      }
      return done();
    });
  }
}

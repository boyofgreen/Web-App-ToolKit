#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    currentPath,
    targetPath;

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
  // move contents of the assets folder to the windows platform dir
  var sourcePath = path.resolve(__dirname, "..", "assets\\windows\\css");
  var destPath = path.resolve(__dirname, "..", "..", "..", "platforms\\windows\\www\\css");
  logger.log('Moving css assets for the windows platform.');

  copyAssets(sourcePath, destPath, function (err) {
    if (err) {
      return console.error(err);
    }

    return console.log("Finished copying css assets for the windows platform.");
  });

  sourcePath = path.resolve(__dirname, "..", "assets\\windows\\images");
  destPath = path.resolve(__dirname, "..", "..", "..", "platforms\\windows\\www\\images");
  logger.log('Moving image assets for the windows platform');

  copyAssets(sourcePath, destPath, function (err) {
    if (err) {
      return console.error(err);
    }

    return console.log("Finished copying image assets for the windows platform.");
  });

  sourcePath = path.resolve(__dirname, "..", "assets\\windows\\js");
  destPath = path.resolve(__dirname, "..", "..", "..", "platforms\\windows\\www\\js");

  copyAssets(sourcePath, destPath, function (err) {
    if (err) {
      return console.error(err);
    }

    return console.log("Finished copying js assets for the windows platform.");
  });
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

      if (stats.isDirectory()) {
        return onDir(item);
      }
      else if (stats.isFile()) {
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

  function onDir(dir) {
    var target = dir.name.replace(currentPath, targetPath);
    isWritable(target, function (writable) {
      if (writable) {
        return mkDir(dir, target);
      }
      copyDir(dir.name);
    });
  }

  function mkDir(dir, target) {
    fs.mkdir(target, dir.mode, function (err) {
      if (err) {
        return onError(err);
      }
      copyDir(dir.name);
    });
  }

  function copyDir(dir) {
    fs.readdir(dir, function (err, items) {
      if (err) {
        return onError(err);
      }
      items.forEach(function (item) {
        startCopy(path.join(dir, item));
      });
      return cb();
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
      errs.push(err);
    }
    else {
      errs.write(err.stack + '\n\n');
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

'use strict';

var http = require('http'),
    https = require('https'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    logger = require('./logger');

var Q;

var baseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/winjs/4.1.0/';

var winjsFiles = {
  css: [
    'ui-dark.css',
    'ui-dark.min.css',
    'ui-light.css',
    'ui-light.min.css'
  ],
  fonts : [
    'Symbols.ttf'
  ],
  js: [
    'WinJS.intellisense-setup.js',
    'WinJS.intellisense.js',
    'base.js',
    'base.min.js',
    'ui.js',
    'ui.min.js'
  ]
};

var jsUiStrings = {
  'en-US': 'ui.strings.js'
};

function ensurePathExists(pathName, callback) {
  fs.mkdir(pathName, function (err) {
    if (err) {
      if (err.code === 'ENOENT') {
        return ensurePathExists(path.dirname(pathName), function (err) {
          if (err && callback) {
            return callback && callback(err);
          }

          fs.mkdir(pathName, function (err) {
            if (err && err.code === 'EEXIST') { err = undefined; }
            callback && callback(err);
          });
        });
      } else if (err.code === 'EEXIST') {
        err = undefined;
      }
    }

    callback && callback(err);
  });
};

var downloadFile = function (inputUri, filePath, callback) {
  var uri = url.parse(inputUri);

  if (inputUri.indexOf('http://') !== 0 && inputUri.indexOf('https://') !== 0) {
    // this is to detect scenarios like localhost:8080 where localhost is
    // treated as protocol even if it's not.
    if (inputUri.indexOf(uri.protocol + '//') !== 0) {
      inputUri = 'http://' + inputUri;
      uri = url.parse(inputUri);
    }
  }

  if(!(uri.protocol === 'http:' || uri.protocol === 'https:')) {
    return callback(new Error('Invalid protocol, only http & https are supported'));
  }

  var downloadDir = path.dirname(filePath);
  if (!fs.existsSync(downloadDir)) {
    return callback(new Error('Invalid download directory: ' + downloadDir));
  }

  var lastModified;

  if (fs.existsSync(filePath)) {
    var stats = fs.lstatSync(filePath);
    lastModified = new Date(stats.mtime);
  }

  var options = {
    host: uri.hostname,
    port: uri.port || (uri.protocol === 'https:' ? 443 : 80),
    path: uri.path,
    agent : false
  };

  if (lastModified) {
    options.headers = {
      'if-modified-since': lastModified.toUTCString()
    }
  }

  var protocol = uri.protocol === 'https:' ? https : http;
  protocol.get(options, function(res) {
    // If Moved Permanently or Found, redirect to new URL
    if ([301, 302].indexOf(res.statusCode) > -1) {
      return downloadFile(res.headers.location, filePath, callback);
    }

    // If not OK or Not Modified, throw error
    if ([200, 304].indexOf(res.statusCode) === -1) {
      return callback(new Error('Invalid status code: ' + res.statusCode + ' - ' + res.statusMessage))
    }

    // If Not Modified, ignore
    if (res.statusCode === 304) {
      return callback(undefined, { 'path': filePath, 'statusCode': res.statusCode, 'statusMessage': res.statusMessage });
    }

    // Else save
    res.pipe(fs.createWriteStream(filePath))
       .on('close', function () {
          var lastAccessed = new Date();
          var lastModified = res.headers['last-modified'] ? new Date(res.headers['last-modified']) : lastAccessed;

          // update the last modified time of the file to match the response header
          fs.utimes(filePath, lastAccessed, lastModified, function (err) {
            return callback(err, { 'path': filePath, 'statusCode': res.statusCode, 'statusMessage': res.statusMessage });
          });
       });

  }).on('error', function(err) {
    return callback(err);
  });
}

function downloadFileTo(fileUrl, filePath) {
  var task = Q.defer();
  ensurePathExists(path.dirname(filePath), function() {
    downloadFile(fileUrl, filePath, function (err, data) {
      if (err) {
        logger.log(err);
        return task.reject();
      }

      if (data.statusCode !== 304){
        logger.log('Downloaded: ' + path.basename(filePath));
      }

      return task.resolve();
    })
  });

  return task.promise;
}

function downloadWinJSFiles(context, callback) {
  Q = context.requireCordovaModule('q');
  var pendingTasks = [];

  var projectRoot = context.opts.projectRoot;
  var winjsPath = path.join('platforms', 'windows', 'WinJS');

  for (var type in winjsFiles) {
    if (winjsFiles.hasOwnProperty(type)) {
      var files = winjsFiles[type];

      for (var i = 0; i < files.length; i++) {
        var fileName = files[i];
        var fileUrl = url.resolve(baseUrl, type + '/' + fileName);
        var filePath = path.join(projectRoot, winjsPath, type, fileName);
        pendingTasks.push(downloadFileTo(fileUrl, filePath));
      }
    }
  }

  for (var lang in jsUiStrings) {
    if (jsUiStrings.hasOwnProperty(lang)) {
      var fileName = jsUiStrings[lang];
      var fileUrl = url.resolve(baseUrl, 'js/' + lang + '/' + fileName);
      var filePath = path.join(projectRoot, winjsPath, 'js', lang, fileName);
      pendingTasks.push(downloadFileTo(fileUrl, filePath));
    }
  }

  Q.allSettled(pendingTasks).then(callback);
}

module.exports = {
  downloadWinJSFiles: downloadWinJSFiles
};

var winjsDownloader = require('./winjsDownloader');
var Q;

module.exports = function (context) {
  var projectRoot = context.opts.projectRoot;

  // if the windows folder does not exist, cancell the script
  var windowsPath = path.join(projectRoot, "platforms","windows");
  if (!fs.existsSync(windowsPath)) {
    return;
  }

  Q = context.requireCordovaModule('q');
  var task = Q.defer();

  winjsDownloader.downloadWinJSFiles(context, function() {
    return task.resolve();
  });

  return task.promise;
};

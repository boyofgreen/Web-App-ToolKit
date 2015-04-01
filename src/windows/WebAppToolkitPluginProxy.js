
var hostedWebApp = require('com.microsoft.hostedwebapp.HostedWebAppPluginProxy');

var WAT = {
  manifest: undefined,
  components: {  },
  environment: {
    isWindowsPhone: !!(cordova.platformId === 'windows' && navigator.userAgent.match(/Windows Phone/)),
    isWindows: !!(cordova.platformId === 'windows' && !navigator.userAgent.match(/Windows Phone/))
  }
};

module.exports = {
  //  initialize: function (successCallback, errorCallback, args) {
  //TODO
  //  }
}; // exports

function manifestLoaded(evt) {
  WAT.manifest = evt.manifest;
  initialize();
}

function webviewCreated() {
  initialize();
}

cordova.commandProxy.add("WebAppToolkit", module.exports);

document.addEventListener('manifestLoaded', manifestLoaded, false);
document.addEventListener('webviewCreated', webviewCreated, false);

if (!WAT.manifest) {
  hostedWebApp.getManifest(function successCallback(manifestData) {
    WAT.manifest = manifestData;
    initialize();
  });
}

function initialize() {
  if (WAT.manifest) {
    WAT.components.webView = hostedWebApp.getWebView();
    if (WAT.components.webView) {
      var share = require('com.microsoft.webapptoolkit.WATShare');
      share.init(WAT);
    }
  }
}

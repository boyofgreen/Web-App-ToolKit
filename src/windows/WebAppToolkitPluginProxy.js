var manifest;

module.exports = {
  initialize: function (successCallback, errorCallback, args) {
    //TODO
  }
}; // exports

function manifestLoaded(evt) {
  manifest = evt.manifest;
}

cordova.commandProxy.add("WebAppToolkit", module.exports);

document.addEventListener('manifestLoaded', manifestLoaded, false);

if (!manifest) {
  cordova.commandProxy.get('HostedWebApp', 'getManifest')(function successCallback(manifestData) {
    manifest = manifestData;
  });
}

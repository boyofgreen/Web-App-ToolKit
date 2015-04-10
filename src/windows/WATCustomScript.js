
"use strict";

var WAT;
var customScriptConfig;
var loadScriptFiles, readScriptAsync,
logger = window.console;

// Public API
var self = {
  init: function (WATref){
    if (!WAT){
      WAT = WATref;
      customScriptConfig = (WAT.manifest.wat_customScript || {});

      // when inner pages load, do these things...
      WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", loadScriptFiles);
    }
  }
};

// Private functions
loadScriptFiles = function (e) {
    if (customScriptConfig.scriptFiles) {
        for (var scriptIndex = 0; scriptIndex < customScriptConfig.scriptFiles.length; scriptIndex++) {
            var scriptFile = customScriptConfig.scriptFiles[scriptIndex];
            readScriptAsync("ms-appx:///" + scriptFile).then(function (script) {
                var asyncOp = WAT.components.webView.invokeScriptAsync("eval", script);
                asyncOp.oncomplete = function() {
                    logger.log("Custom script " + scriptFile + " injected");
                };
                asyncOp.onerror = function(err) {
                    logger.error("Error during injection of custom script " + scriptFile, err);
                };
                asyncOp.start();
            }, function(err) {
                logger.error("Error during custom scripts injection", err);
            }
            );
        }
    } else {
        logger.warn("No custom script defined");
    }
};

readScriptAsync = function (filePath) {
    var uri = new Windows.Foundation.Uri(filePath);
    var inputStream = null;
    var reader = null;
    var size;

    return Windows.Storage.StorageFile.getFileFromApplicationUriAsync(uri).then(function (script) {
        return script.openAsync(Windows.Storage.FileAccessMode.read);
    }).then(function (stream) {
        size = stream.size;
        inputStream = stream.getInputStreamAt(0);
        reader = new Windows.Storage.Streams.DataReader(inputStream);

        return reader.loadAsync(size);
    }).then(function () {
        var contents = reader.readString(size);
        return contents;
    });
}

module.exports = self; // exports

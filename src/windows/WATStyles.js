
"use strict"

var WAT;
var stylesConfig;
var getCustomCssFile, customCssFileLoadHandler, loadCustomCssFileString, customStylesFromFile;


// Public API
var self = {
  init: function (WATref) {
    if (!WAT) {
      WAT = WATref;
      stylesConfig = WAT.manifest.wat_styles || {};

      if (stylesConfig.customCssFile){
        getCustomCssFile();
      }
    }
  }
};

// Private Methods

getCustomCssFile = function () {
    var cssFile = "ms-appx://" + ((/^\//.test(stylesConfig.customCssFile)) ? "" : "/") + stylesConfig.customCssFile;

    // TODO: log

    var url = new Windows.Foundation.Uri(cssFile);
    Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url)
        .then(
            customCssFileLoadHandler,
            function (err) {
                // TODO: log this error, but let things proceed anyway
            }
        );
};

customCssFileLoadHandler = function (file) {
        Windows.Storage.FileIO.readTextAsync(file)
            .then(
                function (text) {
                    customStylesFromFile = text;
                    WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", loadCustomCssFileString);
                },
                function (err) {
                    // TODO: log this error, but let things proceed anyway
                }
            );
};

loadCustomCssFileString = function () {
      var exec, scriptString;

      // TODO: log

      scriptString = "var cssFileString = '" + customStylesFromFile.replace(/\r\n/gm, " ") + "';" +
          "var cssFileStyleEl = document.createElement('style');" +
          "document.body.appendChild(cssFileStyleEl);" +
          "cssFileStyleEl.innerHTML = cssFileString;";

      exec = WAT.components.webView.invokeScriptAsync("eval", scriptString);
      exec.start();
};

module.exports = self; // exports


"use strict"

var WAT;
var stylesConfig;
var getCustomCssFile, customCssFileLoadHandler, loadCustomCssFileString, customStylesFromFile, loadCustomStyleString, scriptString, cssString,
logger = window.console;


// Public API
var self = {
    init: function (WATref) {
        if (!WAT) {
            WAT = WATref;
            stylesConfig = WAT.manifest.wat_styles || {};

            // Execute element hiding
            WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", loadCustomStyleString);

            if (stylesConfig.customCssFile) {
                getCustomCssFile();
            }
        }
    }
};

// Private Methods

getCustomCssFile = function () {
    var cssFile = "ms-appx://" + ((/^\//.test(stylesConfig.customCssFile)) ? "" : "/") + stylesConfig.customCssFile;

    logger.log("Getting custom css file from " + cssFile);

    var url = new Windows.Foundation.Uri(cssFile);
    Windows.Storage.StorageFile.getFileFromApplicationUriAsync(url)
        .then(
            customCssFileLoadHandler,
            function (err) {
                // log this error, but let things proceed anyway
                logger.error("Error getting custom css file", err);
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
                // log this error, but let things proceed anyway
                logger.warn("Error reading custom css file", err);
            }
        );
};

loadCustomCssFileString = function () {
    var exec, scriptString;

    logger.log("injecting styles: ", customStylesFromFile.replace(/\r\n/gm, " "));

    scriptString = "var cssFileString = '" + customStylesFromFile.replace(/\r\n/gm, " ") + "';" +
        "var cssFileStyleEl = document.createElement('style');" +
        "document.body.appendChild(cssFileStyleEl);" +
        "cssFileStyleEl.innerHTML = cssFileString;";

    exec = WAT.components.webView.invokeScriptAsync("eval", scriptString);
    exec.start();
};

loadCustomStyleString = function () {
    var i, l, hiddenEls, exec,
        scriptString = "",
        cssString = "";

    if (stylesConfig.suppressTouchAction === true) {
        cssString += "body{touch-action:none;}";
    }

    if (stylesConfig.hiddenElements && stylesConfig.hiddenElements !== "") {
        hiddenEls = stylesConfig.hiddenElements;
        var elements = "";
        for (i = 0; i < hiddenEls.length - 1; i++) {
            elements += hiddenEls[i] + ",";
        }
        elements += hiddenEls[hiddenEls.length - 1];
        cssString += elements + "{display:none !important;}";
    }

    //custom css string to add whatever you want
    if (stylesConfig.customCssString) {
        cssString += stylesConfig.customCssString;
    }

    scriptString += "var cssString = '" + cssString + "';" +
        "var styleEl = document.createElement('style');" +
        "document.body.appendChild(styleEl);" +
        "styleEl.innerHTML = cssString;";

    exec = WAT.components.webView.invokeScriptAsync("eval", scriptString);
    exec.start();
};


module.exports = self; // exports

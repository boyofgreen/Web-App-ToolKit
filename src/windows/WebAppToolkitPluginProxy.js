
"use strict";

var hostedWebApp = require('com.microsoft.hostedwebapp.HostedWebAppPluginProxy');

var WAT = {
  manifest: undefined,
  components: {  },
  environment: {
    isWindowsPhone: !!(cordova.platformId === 'windows' && navigator.appVersion.indexOf("Windows Phone 8.1;") !== -1),
    isWindows: !!(cordova.platformId === 'windows' && navigator.appVersion.indexOf("Windows Phone 8.1;") === -1)
  },
  isFunction: function (f) {
    return Object.prototype.toString.call(f) == '[object Function]';
  }
};

module.exports = {
  //  initialize: function (successCallback, errorCallback, args) {
  //TODO
  //  }
}; // exports

cordova.commandProxy.add("WebAppToolkit", module.exports);

// The following code loads WinJS ui modules
(function(onReady) {
  function loadWinJScss () {
    var linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");

    if (navigator.appVersion.indexOf("Windows Phone 8.1;") !== -1) {
      // windows phone 8.1 + Mobile IE 11
      linkElem.href = "//Microsoft.Phone.WinJS.2.1/css/ui-dark.css";
    } else if (navigator.appVersion.indexOf("MSAppHost/2.0;") !== -1) {
      // windows 8.1 + IE 11
      linkElem.href = "//Microsoft.WinJS.2.0/css/ui-dark.css";
    } else {
      // windows 8.0 + IE 10
      linkElem.href = "//Microsoft.WinJS.1.0/css/ui-dark.css";
    }

    linkElem.addEventListener("load", onReady);
    document.head.appendChild(linkElem);
  }

  var scriptElem = document.createElement("script");

  if (navigator.appVersion.indexOf("Windows Phone 8.1;") !== -1) {
    // windows phone 8.1 + Mobile IE 11
    scriptElem.src = "//Microsoft.Phone.WinJS.2.1/js/ui.js";
  } else if (navigator.appVersion.indexOf("MSAppHost/2.0;") !== -1) {
    // windows 8.1 + IE 11
    scriptElem.src = "//Microsoft.WinJS.2.0/js/ui.js";
  } else {
    // windows 8.0 + IE 10
    scriptElem.src = "//Microsoft.WinJS.1.0/js/ui.js";
  }
  scriptElem.addEventListener("load", loadWinJScss);
  document.head.appendChild(scriptElem);

  // Create stage element
  var stage = document.createElement("div");
  stage.id = "stage";
  WAT.components.stage = stage;
  document.body.appendChild(stage);
})(function () {
  document.addEventListener('manifestLoaded', function (evt) {
    WAT.manifest = evt.manifest;
    initialize();
  }, false);
  document.addEventListener('webviewCreated', function () {
    initialize();
  }, false);

  if (!WAT.manifest) {
    hostedWebApp.getManifest(function successCallback(manifestData) {
      WAT.manifest = manifestData;
      initialize();
    });
  }
});


function initialize() {
  if (WAT.manifest) {
    WAT.components.webView = hostedWebApp.getWebView();
    if (WAT.components.webView) {
      require('com.microsoft.webapptoolkit.WATWrapperHtml').init(WAT);
      require('com.microsoft.webapptoolkit.WATAppBar').init(WAT);
      require('com.microsoft.webapptoolkit.WATShare').init(WAT);
      require('com.microsoft.webapptoolkit.WATNavigation').init(WAT);
      require('com.microsoft.webapptoolkit.WATStyles').init(WAT);
      require('com.microsoft.webapptoolkit.WATCustomScript').init(WAT);
      require('com.microsoft.webapptoolkit.WATNavBar').init(WAT);
      require('com.microsoft.webapptoolkit.WATHeader').init(WAT);
    }
  }
}


"use strict";

var hostedWebApp = require('com-manifoldjs-hostedwebapp.HostedWebAppPluginProxy');

var guids = [];

var WAT = {
  manifest: undefined,
  components: {  },
  environment: {
    isWindowsPhone: !!(cordova.platformId === 'windows' && navigator.appVersion.indexOf("Windows Phone 8.1;") !== -1),
    isWindows: !!(cordova.platformId === 'windows' && navigator.appVersion.indexOf("Windows Phone 8.1;") === -1)
  },
  isFunction: function (f) {
    return Object.prototype.toString.call(f) == '[object Function]';
  },
  getGUID: function () {
      var newGUID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
      if (guids.indexOf(newGUID) > -1) {
          return self.getGUID();
      } else {
          return newGUID;
      }
  },
  escapeRegex: function (str) {
      return ("" + str).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
  },

  convertPatternToRegex: function (pattern, excludeLineStart, excludeLineEnd) {
      var isNot = (pattern[0] == '!');
      if (isNot) { pattern = pattern.substr(1) };

      var regexBody = WAT.escapeRegex(pattern);

      excludeLineStart = !!excludeLineStart;
      excludeLineEnd = !!excludeLineEnd;

      regexBody = regexBody.replace(/\\\?/g, ".?").replace(/\\\*/g, ".*?");
      if (isNot) { regexBody = "((?!" + regexBody + ").)*"; }
      if (!excludeLineStart) { regexBody = "^" + regexBody; }
      if (!excludeLineEnd) { regexBody += "$"; }

      return new RegExp(regexBody);
  },
  goToLocation: function (location) {
      var target = new Windows.Foundation.Uri(location || WAT.manifest.startUrl);

      WAT.components.webView.navigate(target.toString());

      //here we'll close the menus when we start to navigate

      if (WAT.manifest.wat_appBar && WAT.components.appBar.winControl && WAT.manifest.wat_appBar.enabled) {
          WAT.components.appBar.winControl.hide();
      }
      if (WAT.manifest.wat_navBar && WAT.manifest.wat_navBar.enabled && WAT.components.navBar.parentNode && WAT.components.navBar.parentNode.winControl) {
          WAT.components.navBar.parentNode.winControl.hide();
      }
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
      require('com.microsoft.webapptoolkit.WATSettings').init(WAT);
    }
  }
}

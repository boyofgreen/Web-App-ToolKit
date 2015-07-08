
"use strict";

var hostedWebApp = require('cordova-plugin-hostedwebapp.HostedWebAppPluginProxy');

var guids = [];

var WAT = {
  manifest: undefined,
  components: {  },
  environment: {
    isWindowsPhone: !!(cordova.platformId === 'windows' && navigator.appVersion.indexOf("Windows Phone") !== -1),
    isWindows: !!(cordova.platformId === 'windows' && navigator.appVersion.indexOf("Windows Phone") === -1)
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
          WAT.components.appBar.winControl.close();
      }
      if (WAT.environment.isWindows && WAT.manifest.wat_navBar && WAT.manifest.wat_navBar.enabled && WAT.components.navBar.parentNode && WAT.components.navBar.parentNode.winControl) {
          WAT.components.navBar.parentNode.winControl.close();
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
(function (onReady) {
    function loadWinJScss() {
        var linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.href = "/WinJS/css/ui-dark.css";
        linkElem.addEventListener("load", onReady);
        document.head.appendChild(linkElem);
    }

    function loadWinJS4js(onReady) {
        var scriptElem = document.createElement("script");
        scriptElem.src = "/WinJS/js/ui.js";
        scriptElem.addEventListener("load", loadWinJScss);
        document.head.appendChild(scriptElem);
    }

    // we'll delete the reference to base.js of WinJS 2 (added by cordova) and replace it with a reference to base.js of WinJS 4.
    var scriptElem;
    var selector;

    if (navigator.appVersion.indexOf("Windows Phone") !== -1) {
        // it's phone
        selector = "script[src='//Microsoft.Phone.WinJS.2.1/js/base.js']"
    }
    else {
        // not phone
        selector = "script[src='//Microsoft.WinJS.2.0/js/base.js']"
    }

    scriptElem = document.querySelector(selector);

    if (scriptElem) {
        scriptElem.parentNode.removeChild(scriptElem);
    }

    scriptElem = document.createElement("script");
    scriptElem.src = "/WinJS/js/base.js";
    scriptElem.addEventListener("load", loadWinJS4js);

    document.head.appendChild(scriptElem);})(function () {
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
      require('com.microsoft.webapptoolkit.WATNavBar').init(WAT);
      require('com.microsoft.webapptoolkit.WATStyles').init(WAT);
      require('com.microsoft.webapptoolkit.WATCustomScript').init(WAT);
      require('com.microsoft.webapptoolkit.WATHeader').init(WAT);
      require('com.microsoft.webapptoolkit.WATLiveTiles').init(WAT);
      require('com.microsoft.webapptoolkit.WATSettings').init(WAT);
      require('com.microsoft.webapptoolkit.WATSecondaryPins').init(WAT);

      // in Windows 10, we need to wait to bind WinJS controls to the last possible moment, otherwise there are issues modifying previously initialized controls.
      WinJS.UI.processAll();
    }
  }
}


"use strict";

var configureBackButton, navigateBack;
var WAT, navConfig;

// Public API
var self = {
  init: function (WATref) {
    if (!WAT) {
      WAT = WATref;
      navConfig = WAT.manifest.wat_navigation || {};

      configureBackButton(WATref);
    }
  }
};

// Private methods

configureBackButton = function () {
  WinJS.UI.processAll().then(function () {
    // Back button
    WinJS.Application.onbackclick = navigateBack;
  });

  if (WAT.components.backButton) {
    // handle back button clicks
    WAT.components.backButton.addEventListener("click", navigateBack);
  }
};

navigateBack = function (e) {
  var view = WAT.components.webView;

  if (!view.canGoBack) {
    return false;
  }

  try {
    view.goBack();
  } catch (err) {
    return false;
  }

  return true;
}


module.exports = self; // exports

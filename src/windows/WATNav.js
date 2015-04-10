
"use strict";

var createBackButton, configureBackButton, navigateBack;
var WAT, navConfig, webViewNavStart, webViewNavComplete;

// Public API
var self = {
  init: function (WATref) {
    if (!WAT) {
      WAT = WATref;
      navConfig = WAT.manifest.wat_navigation || {};

      // Build back button only for Windows
      if (WAT.environment.isWindows) {
          configureBackButton(WATref);

          WAT.components.webView.addEventListener("MSWebViewNavigationStarting", webViewNavStart);
          WAT.components.webView.addEventListener("MSWebViewNavigationCompleted", webViewNavComplete);
      }

      WinJS.Application.onbackclick = navigateBack;
    }
  },

  toggleBackButton: function (makeVisible) {
      if (makeVisible) {
          WAT.components.backButton.style.display = "block";
      }
      else
      {
          WAT.components.backButton.style.display = "none";
      }
  }
};

// Private methods

configureBackButton = function () {
    WinJS.UI.processAll().then(function () {
        // create back button
        createBackButton();



        if (WAT.components.backButton) {
            // handle back button clicks
            WAT.components.backButton.addEventListener("click", navigateBack);

            if (!WAT.components.webView.canGoBack) {
                self.toggleBackButton(false);
            }
        }
    });
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

createBackButton = function () {
    var wrapperDiv = document.createElement("div");

    wrapperDiv.id = "backbutton-wrapper";
    wrapperDiv.style.zIndex = WAT.components.webView.style.zIndex + 100;
    wrapperDiv.style.position = "absolute";
    wrapperDiv.style.top = "0";
    wrapperDiv.style.left = "0";
    wrapperDiv.style.padding = "50px";
    wrapperDiv.style.width = "150px";
    wrapperDiv.style.height = "50px";

    var btn = document.createElement("btn");
    btn.classList.add("win-backbutton");
    btn.style.color = "black";
    btn.style.borderColor = "black";

    WAT.components.backButton = wrapperDiv;

    wrapperDiv.appendChild(btn);
    document.body.appendChild(wrapperDiv);
}

webViewNavStart = function (e) {
    self.toggleBackButton(false);
}

webViewNavComplete = function (e) {
    if (WAT.components.webView.canGoBack) {
        self.toggleBackButton(true);
    }
}

module.exports = self; // exports

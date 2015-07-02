
"use strict";

var addAppBar, setupAppBar, setButtonAction, handleBarEval, handleBarNavigate, handleBarShare;
var WAT, appBarConfig, barActions, settingsConfig;

// Public API
var self = {
  init: function (WATref) {
      if (!WAT) {
          WAT = WATref;
          appBarConfig = (WAT.manifest.wat_appBar || {});
          settingsConfig = (WAT.manifest.wat_settings || {});

          barActions = {
              eval: handleBarEval,
              navigate: handleBarNavigate,
              share: handleBarShare
          };

          if (appBarConfig.enabled || settingsConfig.enabled) {
              addAppBar();
          }
      }
  }
};

// Private methods

addAppBar = function () {

    var div = document.createElement("div");
    div.setAttribute("data-win-control", "WinJS.UI.AppBar");
    div.setAttribute("data-win-options", "{placement: 'bottom'}");
    div.style.zIndex = 11111;

    document.body.appendChild(div);
    WAT.components.appBar = div;

    setupAppBar();
};

setupAppBar = function () {
  var appBarEl = WAT.components.appBar;

  //appBarEl.winControl.sticky = appBarConfig.makeSticky;

  // Determine whether to build the app bar only for the privacy button.
  var privacyOnly = WAT.manifest.wat_settings &&
  WAT.manifest.wat_settings.enabled &&
  WAT.manifest.wat_settings.privacyUrl != "";

  // Determine whether the share button should be shown
  var showShare = WAT.manifest.wat_share &&
  WAT.manifest.wat_share.enabled &&
  WAT.manifest.wat_share.showButton;

  // Do not delete the app bar element if the privacy setting is present.
  if (!showShare && !privacyOnly && (!appBarConfig.enabled || !appBarEl)) {
      if (appBarEl) {
          appBarEl.parentNode.removeChild(appBarEl);
          appBarEl = null;
      }
      return;
  }

  // At this point we are building the app bar and forcing it enabled. We need this in case the app bar is disabled by configuration, but there's a privacy setting configured.
  appBarConfig.enabled = true;

  appBarConfig.buttons = (appBarConfig.buttons || []);
  appBarConfig.buttons.forEach(function (menuItem) {
      // Do not include the Setting button in the appBar in Windows Phone apps
      if (menuItem.action !== "settings" || WAT.environment.isWindows) {

          var btn = document.createElement("button");
          btn.setAttribute("data-win-control", "WinJS.UI.AppBarCommand");
          btn.setAttribute("data-win-options", "{label:'" + menuItem.label + "',icon:'" + menuItem.icon + "',tooltip:'Remove item',section:'" + menuItem.section + "'}");

          setButtonAction(btn, menuItem);

          appBarEl.appendChild(btn);
      }
  });
};

setButtonAction = function (btn, menuItem) {
  var action = menuItem.action.toLowerCase(),
  data = menuItem.data,
  handler = barActions[action];

  if (!handler) {
      // default handler is webview navigation
      handler = barActions["navigate"];
      data = menuItem.action;
  }

  //if (!WAT.isFunction(handler)) {
  // This is a non-operational bar item (maybe nested nav?)
  //return;
  //}

  if (data === "home") {
      data = WAT.manifest.start_url;
  }

  btn.dataset.barActionData = data;
  //handle children case
  if (menuItem.children && menuItem.children.length) {
      btn.children[0].addEventListener("click", handler);
  } else {
      btn.addEventListener("click", handler);
  }
};

// app and nav bar action handlers

handleBarEval = function () {
  var scriptString = "(function() { " + this.dataset.barActionData + " })();";
  WAT.components.webView.invokeScriptAsync("eval", scriptString).start();
};

handleBarNavigate = function () {
  var url = (this.dataset.barActionData || WAT.manifest.start_url);
  var target = new Windows.Foundation.Uri(url);
  WAT.components.webView.navigate(target.toString());
};

handleBarShare = function () {
  Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
};

module.exports = self; // exports

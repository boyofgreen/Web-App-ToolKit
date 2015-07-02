
"use strict";

// Private method declaration
var WAT, settingsConfig,
addSetting,
addSettings,
logger = window.console;

// Public API
var self = {
  active: false,
  init: function (WATRef) {
    if (!WAT){
      WAT = WATRef;
      settingsConfig = (WAT.manifest.wat_settings || {});
    }

    addSettings();
  },

  navigateBack: function () {
    if (self.active) {
        return true;
    }

    return false;
  }
};

// Private methods
addSetting = function (label, callback) {
  // appbar needs to be enabled.
  if (!WAT.components.appBar) {
      return;
  }

  var btn = document.createElement("button");
  var cmd = new WinJS.UI.AppBarCommand(btn, { label: label, section: "secondary" });
  cmd.onclick = callback;

  WAT.components.appBar.appendChild(btn);
}

// This method works stand-alone on phone or as part of the settings charm handler on windows 8
addSettings = function () {
  var rs = WinJS.Resources;

  if (settingsConfig &&
    settingsConfig.enabled &&
    settingsConfig.privacyUrl) {
    var privacy = rs.getString("privacy");
    addSetting(privacy.value, function () {
        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(settingsConfig.privacyUrl));
    });
  }

  if (settingsConfig &&
    settingsConfig.enabled &&
    settingsConfig.items &&
    settingsConfig.items.length) {

      settingsConfig.items.forEach(function (item) {
        addSetting(item.title,
                    function () {
                        if (item.loadInApp === true) {
                            WAT.goToLocation(item.page);
                        } else {
                            Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(item.page));
                        }
                    }
                );
        });
    }
}

module.exports = self;

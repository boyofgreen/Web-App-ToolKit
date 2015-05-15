
"use strict";

// Private method declaration
var WAT, settingsConfig;
var setupSettingsCharm,
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

    if (WAT.environment.isWindowsPhone) {
        // On phone add settings right away
        WinJS.UI.processAll().then(function () {
            addSettings();
            WAT.components.appBar.winControl.disabled = true;
            WAT.components.appBar.winControl.disabled = false;

        });
    } else {
        // Otherwise, add settings on callback from settings charm
        WinJS.Application.onsettings = setupSettingsCharm;
    }
  },

  navigateBack: function () {
    if (self.active) {
        self.hideFlyout();
        return true;
    }

    return false;
  },

  showFlyout: function (flyoutUrl) {
    self.active = true;
    WinJS.Utilities.empty(WAT.components.flyoutHost);
    WinJS.UI.Pages.render(flyoutUrl, WAT.components.flyoutHost).done();
    WinJS.Utilities.addClass(WAT.components.webView, "hidden");
    WinJS.Utilities.removeClass(WAT.components.flyoutHost, "hidden");
  },

  hideFlyout: function () {
    self.active = false;
    WinJS.Utilities.addClass(WAT.components.flyoutHost, "hidden");
    WinJS.Utilities.removeClass(WAT.components.webView, "hidden");
    WinJS.Utilities.empty(WAT.components.flyoutHost);
  }
};

// Private methods
addSetting = function (applicationCommands, label, callback) {

  // If Windows Phone, add as secondary command which will make it a menu item
  if (WAT.environment.isWindowsPhone) {

    if (!WAT.components.appBar) {
        return;
    }

    var btn = document.createElement("button");
    btn.addEventListener("click", callback);
    new WinJS.UI.AppBarCommand(btn, { label: label, section: "selection" });
    WAT.components.appBar.appendChild(btn);

  // Otherwise, add to application commands
  } else {
    applicationCommands.append(
        new Windows.UI.ApplicationSettings.SettingsCommand("defaults", label, callback));
  }
}

// This method works stand-alone on phone or as part of the settings charm handler on windows 8
addSettings = function (applicationCommands) {
  var rs = WinJS.Resources;

  if (settingsConfig &&
    settingsConfig.enabled &&
    settingsConfig.privacyUrl) {
    var privacy = rs.getString("privacy");
    addSetting(applicationCommands, privacy.value, function () {
        Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(settingsConfig.privacyUrl));
    });
  }

  if (settingsConfig &&
    settingsConfig.enabled &&
    settingsConfig.items &&
    settingsConfig.items.length) {

      settingsConfig.items.forEach(function (item) {
        addSetting(applicationCommands, item.title,
                    function () {
                        if (item.loadInApp === true) {
                            //WAT.goToLocation(item.page);
                            WAT.components.webView.navigate(new Windows.Foundation.Uri(item.page));
                        } else {
                            Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(item.page));
                        }
                    }
                );
        });
    }
}

setupSettingsCharm = function (e) {

  // Use function above that can be called on phone as well
  addSettings(e.detail.e.request.applicationCommands);
  var rS = WinJS.Resources;

  if (!e.detail.applicationcommands) {
    e.detail.applicationcommands = { };
  }

  // // TODO: This doesn't seem right at all. e.detail doesn't even seem valid. - JB - 2014-05-15
  // if (WAT.config.notifications &&
  //   WAT.config.notifications.enabled &&
  //   WAT.config.notifications.azureNotificationHub &&
  //   WAT.config.notifications.azureNotificationHub.enabled) {
  //
  //   // Adds notification page command link to the settings flyout pane
  //   e.detail.applicationcommands.notifications = {
  //       title: rS.getString("notificationsTitle").value,
  //           href: "/template/notify-settings.html"
  //   };
  //
  //   // Add this line to add another settings fly out page
  //   //    ,"about": { title: "About", href: "/template/about.html" }
  // }

  // if (WAT.config.isroller === true || localStorage.getItem("savedHostURL")) {
  //   //for sample app, add a persistant link to application page
  //   e.detail.applicationcommands.roller = {
  //       title: rS.getString("rollerTitle").value,
  //       href: "/template/roller-settings.html"
  //   };
  // }

  WinJS.UI.SettingsFlyout.populateSettings(e);
};

module.exports = self;

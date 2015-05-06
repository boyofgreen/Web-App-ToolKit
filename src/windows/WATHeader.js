
"use strict";

  // Private method declaration
var WAT;
var headerConfig, setupHeader, setPageTitle, webviewNavComplete,
      logger = window.console;

  // Public API
  var self = {

      init: function (WATRef) {
          if (!WAT){
            WAT = WATRef;
            headerConfig = (WAT.manifest.wat_header || {});

            setupHeader();

            WAT.components.webView.addEventListener("MSWebViewNavigationCompleted", webviewNavComplete);
          }
      },

      setPageTitle: function (home) {

          if (!headerConfig || !headerConfig.title || !headerConfig.title.enabled || headerConfig.title.enabled !== true)
              return;

          if (headerConfig.title.displayOnHomePage === false) {
              if (home) {
                  WAT.options.title.innerHTML = "";
                  WAT.options.title.hidden = true;
                  WAT.options.logo.hidden = false;
                  return;
              }
          }

          var title = WAT.components.webView.documentTitle;

          var start = title.indexOf(" | ");
          var stop = title.indexOf(" | ", start + 1);

          if (start == -1) {
              start == 0;
              stop = title.length;
          }
          else {
              if (start != -1 && stop == -1) {
                  stop = start;
                  start = 0;
              }
              else {
                  start = start + 3;
              }
          }

          title = title.substring(start, stop);

          WAT.components.title.innerHTML = "<span class='pagetitle'>" + title + "</span>";
          WAT.components.title.hidden = false;
          WAT.components.logo.hidden = true;
      }

  };

  setupHeader = function () {
      if (!headerConfig || headerConfig.enabled !== true) {
          WAT.components.header.style.background = "transparent";
          WAT.components.stage.style.msGridRow = 1;
          WAT.components.stage.style.msGridRowSpan = 2;
      }
      else {
          if (headerConfig.backgroundColor) {
              WAT.components.header.style.background = headerConfig.backgroundColor;
          }

          if (WAT.environment.isWindowsPhone && WAT.manifest.wat_navBar && WAT.manifest.wat_navBar.enabled) {
              var navBgColor = WAT.manifest.wat_navBar.backgroundColor ? WAT.manifest.wat_navBar.backgroundColor : headerConfig.navDrawerBackgroundColor;

              WAT.components.navDrawer.style.background = navBgColor;
              document.getElementById("navDrawerIconTextItem").style.background = navBgColor;
          }

          if (headerConfig.logo) {
              WAT.components.logo.src = headerConfig.logo;
          }
      }
  };

  webviewNavComplete = function () {
      self.setPageTitle(false);
  }

  module.exports = self; // exports

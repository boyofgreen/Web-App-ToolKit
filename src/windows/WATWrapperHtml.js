
"use strict";

  var WAT;
  var buildForWindows, buildForWindowsPhone;
  var createHeaderElement, createStageElement, moveWebView, createWebViewForModalDialog, createFlyoutHost;

  var self = {
      init: function (WATRef) {
          if (!WAT) {
              WAT = WATRef;

              if (WAT.environment.isWindows) {
                  // build wrapper html for windows
                  var content = document.createElement("div");
                  content.id = "content";
                  content.classList.add("content");
                  document.body.appendChild(content);
                  WAT.components.content = content;

                  buildForWindows();
              }
              else {
                  // build wrapper html for windows phone
                  buildForWindowsPhone();
              }

              // hide cordova app div
              document.getElementsByClassName("app")[0].style.display = "none";

              // remove cordova's stylesheet
              var cordovaStyles = document.getElementsByTagName("link")[0];
              cordovaStyles.parentNode.removeChild(cordovaStyles);

              // add base wrapper styles
              var styles = document.createElement("link");
              styles.setAttribute("rel", "stylesheet");
              styles.setAttribute("type", "text/css");
              styles.href = "css/wrapper-styles.css";
              document.head.appendChild(styles);
          }
      }
  };

  buildForWindows = function () {
     // add base stylesheet
      var base = document.createElement("link");
      base.setAttribute("rel", "stylesheet");
      base.setAttribute("type", "text/css");
      base.href = "css/base.css";
      document.head.appendChild(base);

      createHeaderElement();
      createStageElement();
      createWebViewForModalDialog();
      moveWebView();
  };

  buildForWindowsPhone = function () {
      // add theme styles for Windows Phone
      var theme = document.createElement("link");
      theme.setAttribute("rel", "stylesheet");
      theme.setAttribute("type", "text/css");
      theme.href = "css/ui-themed.theme-dark.css";
      document.head.appendChild(theme);

      // add wrapper styles for windows phone
      var linkElem = document.createElement("link");
      linkElem.setAttribute("rel", "stylesheet");
      linkElem.setAttribute("type", "text/css");
      linkElem.href = "css/wrapper-phone.css";
      document.head.appendChild(linkElem);

      // viewport parent div
      var viewport = document.createElement("div");
      viewport.id = "viewport";
      viewport.classList.add("viewport");

      // surface div
      var surface = document.createElement("div");
      surface.id = "surface";
      surface.classList.add("surface");
      surface.style.zIndex = WAT.components.webView.zIndex + 100;

      // nav drawer div
      var navDrawer = document.createElement("div");
      navDrawer.id = "navDrawer";
      navDrawer.classList.add("navDrawer");

      // search box
      var searchBox = document.createElement("input");
      searchBox.type = "text";
      searchBox.name = "search-box";
      searchBox.id = "search-box";
      searchBox.classList.add("search-box");

      // TODO: enable search box when wat_search is implemented.
      searchBox.style.display = "none";

      navDrawer.appendChild(searchBox);
      WAT.components.navDrawer = navDrawer;

      // navdrawer list view
      var listview = document.createElement("div");
      listview.id = "navDrawerListView";
      listview.classList.add("win-selectionstylefilled");

      navDrawer.appendChild(listview);

      surface.appendChild(navDrawer);

      // up a level
      var content = document.createElement("div");
      content.id = "content";
      content.classList.add("content");
      document.body.appendChild(content);
      WAT.components.content = content;

      createStageElement();
      createFlyoutHost();

      surface.appendChild(content);

      viewport.appendChild(surface);
      document.body.appendChild(viewport);

      createHeaderElement();
      moveWebView();
  };

  // Windows Wrapper HTML functions
  createHeaderElement = function () {
      // header div
      var header = document.createElement("div");
      header.id = "header";
      header.classList.add("header");
      header.style.zIndex = WAT.components.webView.style.zIndex + 100;

      if (!WAT.environment.isWindows) {
          // hamburger
          var hamburger = document.createElement("div");
          hamburger.id = "hamburger";
          hamburger.classList.add("hamburger");
          header.appendChild(hamburger);
      }

      // logo div
      var logoArea = document.createElement("div");
      logoArea.classList.add("logoarea");

      // logo img
      var logoImage = document.createElement("img");
      logoImage.id = "logo";
      logoArea.appendChild(logoImage);
      header.appendChild(logoArea);

      // title
      var title = document.createElement("h1");
      title.id = "title";
      title.classList.add("titlearea");
      title.classList.add("win-type-ellipsis");
      header.appendChild(title);


      // search box
      var searchbox = document.createElement("div");
      searchbox.id = "search-box";
      searchbox.classList.add("search-box");

      // TODO: enable search box when wat_search is implemented.
      searchbox.style.display = "none";

      header.appendChild(searchbox);

      WAT.components.content.appendChild(header);

      WAT.components.header = header;
      WAT.components.logo = logoArea;
      WAT.components.title = title;
  }

  createStageElement = function () {
      var stage = document.createElement("div");
      stage.id = "stage";
      stage.classList.add("stage");
      WAT.components.stage = stage;
      WAT.components.content.appendChild(stage);
  };

  moveWebView = function () {
      var webView = WAT.components.webView;
      webView.id = "main-view";
      WAT.components.stage.appendChild(webView);
  };

  createWebViewForModalDialog = function () {
       var modalStage = document.createElement("div");
       modalStage.id = "modal-stage";
       modalStage.classList.add("stage");
       modalStage.classList.add("overlay-stage");
       modalStage.style.zIndex = WAT.components.webView.style.zIndex + 100;

       var webView = document.createElement("x-ms-webview");
       webView.id = "dialog-view";
       webView.classList.add("modal-content");

       var button = document.createElement("button");
       button.id = "close";
       button.classList.add("win-closebutton");
       button.innerText = "X";

       modalStage.appendChild(webView);
       modalStage.appendChild(button);
       document.body.appendChild(modalStage);

       WAT.components.dialogView = webView;
   };

  createFlyoutHost = function () {
      var div = document.createElement("div");
      div.classList.add("flyout-host");
      div.classList.add("hidden");

      WAT.components.stage.appendChild(div);
      WAT.components.flyoutHost = div;
  }

  module.exports = self; // export

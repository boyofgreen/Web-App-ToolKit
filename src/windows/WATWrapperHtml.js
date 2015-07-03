"use strict";

  var WAT;
  var buildForWindows, buildForWindowsPhone;
  var createHeaderElement, createStageElement, moveWebView, createWebViewForModalDialog, createTransitionOverlay;

  var self = {
      init: function (WATRef) {
          if (!WAT) {
              WAT = WATRef;

              // add base stylesheet
              var base = document.createElement("link");
              base.setAttribute("rel", "stylesheet");
              base.setAttribute("type", "text/css");
              base.href = "css/base.css";
              document.head.appendChild(base);

              // build wrapper html for windows
              var content = document.createElement("div");
              content.id = "content";
              content.classList.add("content");
              content.classList.add("customColor");
              document.body.appendChild(content);
              WAT.components.content = content;

              buildForWindows();

              // add base wrapper styles
              var styles = document.createElement("link");
              styles.setAttribute("rel", "stylesheet");
              styles.setAttribute("type", "text/css");
              styles.href = "css/wrapper-styles.css";
              document.head.appendChild(styles);

              createTransitionOverlay();
          }
      }
  };

  buildForWindows = function () {
      createHeaderElement();
      createStageElement();
      createWebViewForModalDialog(document.body);
      moveWebView();
  };

  // Windows Wrapper HTML functions
  createHeaderElement = function () {
      // header div
      var header = document.createElement("div");
      header.id = "header";
      header.classList.add("header");
      header.style.zIndex = WAT.components.webView.style.zIndex + 100;

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
      WAT.components.logo = logoImage;
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

  createWebViewForModalDialog = function (appendToElement) {
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
       appendToElement.appendChild(modalStage);

       WAT.components.dialogView = webView;
       WAT.components.closeButton = button;
  };

  createTransitionOverlay = function () {
      var overlay = document.createElement("div");
      overlay.classList.add("webview-overlay");

      if (WAT.environment.isWindows) {
          overlay.style.zIndex = WAT.components.webView.style.zIndex + 1;
          overlay.classList.add("fadeOut");

          var svg = document.createElement("svg");
          svg.setAttribute("preserveAspectRatio", true);

          var defs = document.createElement("defs");
          var filter = document.createElement("filter");
          filter.id = "filtersPicture";

          var blur = document.createElement("feGaussianBlur");
          blur.setAttribute("stdDeviation", "2");

          filter.appendChild(blur);
          defs.appendChild(filter);

          var image = new Image();
          image.setAttribute("x", "0");
          image.setAttribute("y", "0");
          image.setAttribute("height", "100%");
          image.setAttribute("width", "100%");
          image.setAttribute("filter", "url(#filtersPicture)");

          svg.appendChild(defs);
          svg.appendChild(image);
          overlay.appendChild(svg);
      }

      WAT.components.stage.appendChild(overlay);

      var transparent = document.createElement("div");
      transparent.classList.add("transparent-overlay");
      transparent.style.zIndex = WAT.components.webView.style.zIndex + 200;


      WAT.components.stage.appendChild(transparent);

      var div = document.createElement("div");
      div.classList.add("loading-wrapper");
      div.id = "loading-wrapper";
      div.style.zIndex = WAT.components.webView.style.zIndex + 200;

      var progress = document.createElement("progress");
      progress.id = "page-load-progress";
      progress.classList.add("loading-progress");
      progress.classList.add("win-ring");
      progress.classList.add("win-large");
      progress.style.zIndex = WAT.components.webView.style.zIndex + 200;

      div.appendChild(progress);
      WAT.components.stage.appendChild(div);
  };

  module.exports = self; // export

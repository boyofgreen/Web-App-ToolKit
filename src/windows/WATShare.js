
"use strict";

var logger = window.console;
var WAT;
var shareConfig;

// Public API
var self = {
    start: function (WATref) {
        setupShare(WATref);
    }
};

// Private methods
var setupShare = function (WATref) {
  if (!WATref.manifest.wat_share || WATref.manifest.wat_share.enabled !== true) {
      return;
  }

  WAT = WATref;

  shareConfig = WAT.manifest.wat_share;

  var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
  dataTransferManager.addEventListener("datarequested", function handleShareRequest (e) {
    var deferral = e.request.getDeferral();

    if (shareConfig.screenshot) {
      getScreenshot().then(
        function (imageFile) {
          sharePage(e.request, deferral, imageFile);
        },
        function (err) {
          // There was an error capturing, but we still want to share
          logger.warn("Error capturing screenshot, sharing anyway", err);
          sharePage(e.request, deferral, null);
        }
      );
    } else {
      sharePage(e.request, deferral, null);
    }
  });

  if (shareConfig.showButton) {
      addShareButton();
  }
};

var addShareButton = function () {
    var btn,
        buttonText = (shareConfig.buttonText | "Share");

    if (!WAT.components.appBar)
    {
        return;
    }

    if (shareConfig.buttonText)
    {
        buttonText = shareConfig.buttonText;
    }

    var section = (shareConfig.buttonSection || "global");

    btn = document.createElement("button");
    btn.setAttribute("style", "-ms-high-contrast-adjust:none");
    btn.addEventListener("click", function shareClickHandler() {
      Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    });

    new WinJS.UI.AppBarCommand(btn, { id: 'shareButton', label: buttonText, icon: 'url(/images/share.png)', section: section });

    WAT.components.appBar.appendChild(btn);
};

var getScreenshot = function () {
  function processScreenshot (fileStream) {
    return new WinJS.Promise(function (complete, error) {
      var captureOperation = WAT.components.webView.capturePreviewToBlobAsync();

      captureOperation.addEventListener("complete", function (e) {
        var inputStream = e.target.result.msDetachStream();

        Windows.Storage.Streams.RandomAccessStream.copyAsync(inputStream, fileStream).then(
          function () {
            fileStream.flushAsync().done(
              function () {
                inputStream.close();
                fileStream.close();
                complete();
              }
            );
          }
        );
      });

      captureOperation.start();
    });
  };

  var screenshotFile;

  return new WinJS.Promise(function (complete, error) {
    if (!WAT.components.webView.capturePreviewToBlobAsync) {
      // screen capturing not available, but we still want to share...
      error(new Error("The capturing method (capturePreviewToBlobAsync) does not exist on the webview element"));
      return;
    }

    // we create the screenshot file first...
    Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync("screenshot.png", Windows.Storage.CreationCollisionOption.replaceExisting)
      .then(
        function (file) {
          // open the file for reading...
          screenshotFile = file;
          return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
        },
        error
      )
      .then(processScreenshot, error)
      .then(
        function () {
          complete(screenshotFile);
        },
        error
      );
  });
};

var sharePage = function (dataReq, deferral, imageFile) {
  function makeLink (url, content) {
    return "<a href=\"" + url + "\">" + content || url + "</a>";
  }

  var msg = shareConfig.message,
    shareUrl = WAT.components.webView.src, //WatExtensions.SuperCacheManager.resolveTargetUri(WAT.components.webView.src),
    currentURL = shareConfig.url.replace("{currentURL}", shareUrl),
    html = shareConfig.message;

  var displayName = (WAT.manifest.displayName || "");
  var currentApp = Windows.ApplicationModel.Store.CurrentApp;
  var appUri;
  if (currentApp.appId != "00000000-0000-0000-0000-000000000000") {
    appUri = currentApp.linkUri.absoluteUri;
  } else {
    appUri = "Unplublished App, no Store link is available";
  }

  msg = msg.replace("{url}", shareConfig.url).replace("{currentURL}", shareUrl).replace("{appUrl}", appUri).replace("{appLink}", displayName);
  html = html.replace("{currentUrl}", makeLink(shareConfig.url)).replace("{url}", makeLink(shareUrl)).replace("{appUrl}", makeLink(appUri)).replace("{appLink}", makeLink(appUri, displayName));

  var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(html);

  dataReq.data.properties.title = shareConfig.title;

  dataReq.data.setText(msg);

  // TODO: Windows Phone is having problems processing HTML during a share right now - JB - 2014-05-15
  if (!WAT.environment.isWindowsPhone) {
    dataReq.data.setHtmlFormat(htmlFormat);
  }

  // Not doing this as it always includes a link which may not be what
  // the user desired. - JB - 2014-05-15
  // dataReq.data.setWebLink(new Windows.Foundation.Uri(currentURL));

  if (imageFile) {
    dataReq.data.setStorageItems([imageFile], true);
  }

  deferral.complete();
};

module.exports = self; // exports


"use strict";

// Private method declaration
var addShareButton, handleShareRequest, getScreenshot, processScreenshot, sharePage,
logger = window.console;

var WAT, shareConfig;

// Public API
var self = {
  init: function (WATref) {
    if (!WAT) {
      WAT = WATref;
      shareConfig = WAT.manifest.wat_share;

      if (!shareConfig || shareConfig.enabled !== true) {
        return;
      }

      var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
      dataTransferManager.addEventListener("datarequested", handleShareRequest);

      // we need to add the share button to the appbar since there is no more share charm
      addShareButton();
    }
  }
};

// Private methods

addShareButton = function () {
  var btn,
  buttonText = (shareConfig.buttonText || "Share");

  if (!WAT.components.appBar || !WAT.manifest.wat_appBar.enabled) {
    return;
  }

  var section = (shareConfig.buttonSection || "primary");

  btn = document.createElement("button");
  btn.setAttribute("data-win-control", "WinJS.UI.AppBarCommand");
  btn.setAttribute("data-win-options", "{ id: 'shareButton', label: '" + buttonText + "', icon: 'reshare', section: '" + section + "' }");

  btn.addEventListener("click", function shareClickHandler() {
    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
  });

  WAT.components.appBar.appendChild(btn);
};

handleShareRequest = function (e) {
  var deferral = e.request.getDeferral();
  var dataReq = e.request;
  var op = WAT.components.webView.invokeScriptAsync("eval", "document.body.innerHTML.length.toString();");
  op.oncomplete = function (e) {
    if (e.target.result === "0") {
      // No page is loaded in the webview
      sharePage(dataReq, deferral, null);
    }
    else {
      if (shareConfig.screenshot) {
        getScreenshot().then(
          function (imageFile) {
            sharePage(dataReq, deferral, imageFile);
          },
          function (err) {
            // There was an error capturing, but we still want to share
            logger.warn("Error capturing screenshot, sharing anyway", err);
            sharePage(dataReq, deferral, null);
          }
        );
      } else {
        sharePage(dataReq, deferral, null);
      }
    }
  }
  op.start();
};

getScreenshot = function () {
  var screenshotFile;

  return new WinJS.Promise(function (complete, error) {

    if (!WAT.components.webView.capturePreviewToBlobAsync) {
      // screen capturing not available, but we still want to share...
      error(new Error("The capturing method (capturePreviewToBlobAsync) does not exist on the webview element"));
      return;
    }

    // we create the screenshot file first...
    Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync("screenshot.jpg", Windows.Storage.CreationCollisionOption.replaceExisting)
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

processScreenshot = function (fileStream) {
  return new WinJS.Promise(function (complete, error) {
    var captureOperation = WAT.components.webView.capturePreviewToBlobAsync();

    captureOperation.addEventListener("complete", function (e) {
      // Get the screenshot
      var inputStream = e.target.result.msDetachStream();

      // Create a temporary working file
      Windows.Storage.ApplicationData.current.temporaryFolder.createFileAsync("out.png", Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
        // Open the working file
        file.openAsync(Windows.Storage.FileAccessMode.readWrite).then(function (newFileStream) {
          // Copy the screenshot to the working file
          Windows.Storage.Streams.RandomAccessStream.copyAsync(inputStream, newFileStream).then(function () {
            // Write the working file
            newFileStream.flushAsync().done(function () {
              // Create a Bitmap decoder to read the screenshot
              Windows.Graphics.Imaging.BitmapDecoder.createAsync(newFileStream).then(function (dec) {
                // Gets the original picture size
                var originalWidth = dec.pixelWidth;
                var originalHeight = dec.pixelHeight;
                var minPixelSize = originalHeight < originalWidth ? originalHeight : originalWidth;

                // Create a Bitmap encoder to resize the screenshot, using the fileStream received by param
                Windows.Graphics.Imaging.BitmapEncoder.createForTranscodingAsync(fileStream, dec).then(function (encoder) {
                  var newHeight = originalHeight;
                  var newWidth = originalWidth;

                  // The image needs to be scaled
                  if (minPixelSize > 580) {
                    var scaleRatio = 580.0 / minPixelSize;
                    newHeight = originalHeight * scaleRatio;
                    newWidth = originalWidth * scaleRatio;
                  }

                  // Scale the image
                  encoder.bitmapTransform.scaledWidth = newWidth;
                  encoder.bitmapTransform.scaledHeight = newHeight;

                  // trim black margins
                  encoder.bitmapTransform.bounds = {
                    x: 0,
                    y: 0,
                    width: newWidth - newWidth * 0.085,
                    height: newHeight - newHeight * 0.09
                  };

                  dec.getFrameAsync(0).then(function(bitmapFrame) {
                    bitmapFrame.getPixelDataAsync(bitmapFrame.bitmapPixelFormat,
                      bitmapFrame.bitmapAlphaMode,
                      encoder.bitmapTransform,
                      Windows.Graphics.Imaging.ExifOrientationMode.ignoreExifOrientation,
                      Windows.Graphics.Imaging.ColorManagementMode.doNotColorManage)
                    .then(function (pixelData) {
                      // change dimensions and save as JPG
                      encoder.setPixelData(
                        bitmapFrame.bitmapPixelFormat,
                        Windows.Graphics.Imaging.BitmapAlphaMode.ignore,
                        encoder.bitmapTransform.bounds.width,
                        encoder.bitmapTransform.bounds.height,
                        bitmapFrame.dpiX,
                        bitmapFrame.dpiY,
                        pixelData.detachPixelData());

                      // Write the file
                      encoder.flushAsync().then(function () {
                        newFileStream.close();
                        inputStream.close();
                        fileStream.close();
                        complete();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    captureOperation.start();
  });
};

sharePage = function (dataReq, deferral, imageFile) {
  function makeLink (url, content) {
    return "<a href=\"" + url + "\">" + (content || url) + "</a>";
  }

  var msg = shareConfig.message,
    shareUrl = WAT.components.webView.src, //WatExtensions.SuperCacheManager.resolveTargetUri(WAT.components.webView.src),
    currentURL = shareConfig.url.replace("{currentURL}", shareUrl),
    html = shareConfig.message;

  var displayName = (WAT.manifest.displayName || "");
  var currentApp = Windows.ApplicationModel.Store.CurrentApp;

  var appUri = "Unplublished App, no Store link is available";

  try {
    if (currentApp.appId != "00000000-0000-0000-0000-000000000000") {
      appUri = currentApp.linkUri.absoluteUri;
    }
  } catch (e) {
      // TODO: getting WinRTError "The parameter is incorrect" for appId and linkUri. Needs further investigation
      console.log(e.message);
      appUri = "Unable to retrieve application id.";
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

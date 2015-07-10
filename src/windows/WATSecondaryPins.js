
"use strict";

var WAT, pinConfig;
var setupPinning, pinHandler, secondaryPin, download;
var logger = window.console;

var self = {
  init: function(WATRef) {
    if (!WAT){
      WAT = WATRef;
      pinConfig = (WAT.manifest.wat_secondaryPin || {});
      setupPinning();
    }
  }
};

setupPinning = function () {
       var btn,
           buttonText = "Pin this screen";

       if (!pinConfig || pinConfig.enabled !== true || !WAT.components.appBar) {
           return;
       }

       if (pinConfig.buttonText) {
           buttonText = pinConfig.buttonText;
       }

       var section = (pinConfig.buttonSection || "primary");

       btn = document.createElement("button");

       var cmd = new WinJS.UI.AppBarCommand(btn, { label: buttonText, icon: "pin", section: section });
       cmd.onclick = pinHandler;
       btn.setAttribute("id", "pinButton");

       WAT.components.appBar.appendChild(btn);
   };

pinHandler = function () {
    var squareLogoUri, wideLogoUri, wideLogoPath,
        displayName = WAT.components.webView.documentTitle, tileId,
        squareLogoPath = "/images/storelogo.scale-100.png";

   if (displayName === "") {
        displayName = WAT.manifest.name;
    }

   tileId = (displayName + Math.random().toString()).replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-').substring(0, 63);
   var scriptString = "(function() {" +
                         "var el = document.querySelector('" + pinConfig.customImageSelector + "');" +
                         "return el ? el.src : '';" +
                       "})();";
   var asyncOp = WAT.components.webView.invokeScriptAsync("eval", scriptString);
    asyncOp.oncomplete = function (scriptArg) {
        if (scriptArg.target.result) {
            download(scriptArg.target.result, tileId).then(function () {
                squareLogoUri = wideLogoUri = new Windows.Foundation.Uri("ms-appdata:///Local/" + tileId);
                secondaryPin(tileId, displayName, squareLogoUri, wideLogoUri);
            });
        }
        else {
            if (pinConfig.squareImage) {
                squareLogoPath = ((/^\//.test(pinConfig.squareImage)) ? "" : "/") + pinConfig.squareImage;
            }
            squareLogoUri = new Windows.Foundation.Uri("ms-appx://" + squareLogoPath);

            if (pinConfig.wideImage) {
                wideLogoPath = ((/^\//.test(pinConfig.wideImage)) ? "" : "/") + pinConfig.wideImage;
                wideLogoUri = new Windows.Foundation.Uri("ms-appx://" + wideLogoPath);
            }

            secondaryPin(tileId, displayName, squareLogoUri, wideLogoUri);
        }
    };

    asyncOp.start();
};

secondaryPin = function (tileId, displayName, squareLogoUri, wideLogoUri) {
    var secondaryTile = new Windows.UI.StartScreen.SecondaryTile(
            tileId,
            displayName,
            displayName,
            WAT.components.webView.src,
            (Windows.UI.StartScreen.TileOptions.showNameOnLogo | Windows.UI.StartScreen.TileOptions.showNameOnWideLogo),
            squareLogoUri,
            wideLogoUri
        );

    if (pinConfig.tileTextTheme === "light") {
        secondaryTile.visualElements.foregroundText = Windows.UI.StartScreen.ForegroundText.light;
    }
   if (pinConfig.tileTextTheme === "dark") {
        secondaryTile.visualElements.foregroundText = Windows.UI.StartScreen.ForegroundText.dark;
    }

   var selectionRect = document.getElementById("pinButton").getBoundingClientRect();
   secondaryTile.requestCreateForSelectionAsync(
       {
            x: selectionRect.left,
           y: selectionRect.top,
           width: selectionRect.width,
           height: selectionRect.height
        },
       Windows.UI.Popups.Placement.below
   );
};

download = function (imgUrl, imgName) {
  return WinJS.xhr({ url: imgUrl, responseType: "blob" }).then(function (result) {
      var blob = result.response;
      var applicationData = Windows.Storage.ApplicationData.current;
      var folder = applicationData.localFolder;
      return folder.createFileAsync(imgName, Windows.Storage.
             CreationCollisionOption.replaceExisting).then(function (file) {
                 return file.openAsync(Windows.Storage.FileAccessMode.readWrite).
                      then(function (stream) {
                          return Windows.Storage.Streams.RandomAccessStream.copyAsync
                              (blob.msDetachStream(), stream).then(function () {
                                  return stream.flushAsync().then(function () {
                                      stream.close();
                                  });
                              });
                      });
             });
  }, function (e) {
  });
};

module.exports = self;

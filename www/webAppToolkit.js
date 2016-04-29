var webapptoolkit = {
  share: function (url) {
    cordova.exec(undefined, undefined, "WebAppToolkit", "share", [url]);
  }
}

module.exports = webapptoolkit;

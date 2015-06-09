
"use strict";

var configureBackButton, createBackButton, navigateBack, configureRedirects, isWebViewEmpty,
    webViewNavStart, webViewNavComplete, addRedirectRule, processOldRedirectFormat,
    redirectShowMessage, redirectPopout, redirectUrl,
    loadWindowOpenSpy, loadWindowCloseSpy, handleWindowOpen, handleWindowClose, closeModalContent, getUriParameter,
    redirectRules = [],
    redirectActions = {},
    backButtons = [],
    backButtonRules = [],
    logger = window.console;

var WAT, navConfig, redirectConfig;

// Public API
var self = {
  init: function (WATref) {
    if (!WAT) {
      WAT = WATref;
      navConfig = WAT.manifest.wat_navigation || {};
      redirectConfig = (WATref.manifest.wat_redirects || {});

      // Build back button only for Windows
      if (WAT.environment.isWindows) {
          createBackButton();
          configureBackButton(WATref);
      }

      WAT.components.webView.addEventListener("MSWebViewNavigationStarting", webViewNavStart);
      WAT.components.webView.addEventListener("MSWebViewNavigationCompleted", webViewNavComplete);

      configureRedirects(WATref);
      WinJS.Application.onbackclick = navigateBack;
    }
  },

  toggleBackButton: function (isVisible) {
      var state,
          showBackButton = false;

      if (backButtons && backButtons.length) {
          // all back buttons should be in sync, so only toggle on first button's state
          state = backButtons[0].style.display;

          showBackButton = (isVisible === true || (isVisible === undefined && state === "none"));

          backButtons.forEach(function (btn) {
              if (btn.id === "backbutton-wrapper") {
                  // on-page button (hidden vs disabled)
                  btn.style.display = (showBackButton && (navConfig && !navConfig.hideOnPageBackButton)) ? "block" : "none";
              } else if (showBackButton) {
                  btn.classList.remove("disabled");
              } else {
                  btn.classList.add("disabled");
              }
          });
      }
  },

  toggleLoadingScreen: function (isLoading) {
      var clearOverlay = document.querySelector(".transparent-overlay");
      var blurOverlay = document.querySelector(".webview-overlay");

      if (isLoading) {
          if (blurOverlay && clearOverlay) {
              if (WAT.environment.isWindowsPhone) {
                  if (!self.contentLoaded) {
                      clearOverlay.style.display = 'inline';
                      blurOverlay.classList.remove("fadeOut");
                      if (!clearOverlay.classList.contains("overlay-wp")) {
                          clearOverlay.classList.add("overlay-wp");
                      }
                  }
              }
              else {
                  // use base64 encoded bitmap to improve performance in Windows
                  var capturePreview = WAT.components.webView.capturePreviewToBlobAsync();
                  var blurImage = document.querySelector(".webview-overlay svg img");
                  if (!isWebViewEmpty()) {
                      capturePreview.oncomplete = function (completeEvent) {
                          var reader = new window.FileReader();
                          reader.readAsDataURL(completeEvent.target.result);
                          reader.onloadend = function () {
                              // skip show blurred previous page if next page was already shown
                              if (!self.contentLoaded && WAT.components.stage.classList.contains("loading")) {
                                  clearOverlay.style.display = 'inline';

                                  blurImage.setAttribute("src", reader.result);
                                  blurOverlay.classList.remove("fadeOut");
                              }
                          };
                      };
                      capturePreview.start();
                  }
              }
          }

          WAT.components.stage.classList.add("loading");
      } else if (WAT.components.stage.classList.contains("loading")) {
          if (blurOverlay && clearOverlay) {
              clearOverlay.style.display = "none";
              blurOverlay.classList.add("fadeOut");
          }

          WAT.components.stage.classList.remove("loading");
      }
  }
};

// Private methods
isWebViewEmpty = function () {
    var op = WAT.components.webView.invokeScriptAsync("eval", "if (document.body){ document.body.innerHTML.length.toString(); } else {'0'}");
    op.oncomplete = function (e) {
        if (e.target.result === "0") {
            // No page loaded
            return true;
        }
        else {
            // Page loaded
            return false;
        }
    }
    op.start();
};

configureBackButton = function () {
    var hideBackRules = navConfig ? navConfig.hideBackButtonOnMatch : null;

    backButtonRules.push(WAT.convertPatternToRegex(WAT.manifest.start_url));

    if (hideBackRules && hideBackRules.length) {
        hideBackRules.forEach(function (pattern) {
            var fullPattern, regex;

            if (!pattern || !pattern.length) {
                logger.warn("Skipping invalid back button hide rule:", pattern);
                return;
            }

            fullPattern = pattern.replace(/\{baseURL\}/g, WAT.config.baseURL);
            regex = WAT.convertPatternToRegex(fullPattern);
            if (regex) {
                logger.log("Adding back button hide rule: ", pattern, regex);
                backButtonRules.push(regex);
            }
        });
    }

    if (WAT.components.backButton && (navConfig && !navConfig.hideOnPageBackButton)) {
        // we need to hold onto the parent since that is what gets toggled, not the actual <button>
        backButtons.push(WAT.components.backButton.parentNode);

        // handle back button clicks
        WAT.components.backButton.addEventListener("click", navigateBack);
    }
};

navigateBack = function (e) {
  var view = WAT.components.webView;

  if (!view.canGoBack) {
    return false;
  }

  try {
    view.goBack();
  } catch (err) {
    return false;
  }

  return true;
}

createBackButton = function () {
    var wrapperDiv = document.createElement("div");

    wrapperDiv.id = "backbutton-wrapper";
    wrapperDiv.style.zIndex = WAT.components.webView.style.zIndex + 101;
    wrapperDiv.style.display = "none";

    var btn = document.createElement("button");
    btn.classList.add("win-backbutton");
    btn.style.color = "black";
    btn.style.borderColor = "black";

    WAT.components.backButton = btn;

    wrapperDiv.appendChild(btn);
    document.body.appendChild(wrapperDiv);
}

webViewNavStart = function (e) {
    self.contentLoaded = false;
    self.toggleLoadingScreen(true);
    self.toggleBackButton(false);

    // Follow any redirect rules
    if (WAT.manifest.wat_redirects && WAT.manifest.wat_redirects.enabled === true && e.uri.length > 0) {
        redirectRules.forEach(function (rule) {
            if (rule.regex.test(e.uri) && WAT.isFunction(redirectActions[rule.action])) {
                e.stopImmediatePropagation();
                e.preventDefault();
                redirectActions[rule.action](rule, e.uri);
                self.toggleLoadingScreen(false);
                if (WAT.components.webView.canGoBack === true) {
                    self.toggleBackButton(true);
                }
            }
        });
    }
}

webViewNavComplete = function () {
    self.toggleLoadingScreen(false);

    var showBackButton = true;

    if (WAT.components.webView.canGoBack === true) {
        backButtonRules.forEach(function (rule) {
            if (rule.test(WAT.components.webView.src)) {
                showBackButton = false;
            }
        });
    } else {
        showBackButton = false;
    }

    self.toggleBackButton(showBackButton);
}


configureRedirects = function (WATref) {
    redirectActions = {
        showMessage: redirectShowMessage,
        popout: redirectPopout,
        redirect: redirectUrl,
        modal: true
    };

    if (redirectConfig.enabled === true && redirectConfig.rules && redirectConfig.rules.length) {
        redirectConfig.rules.forEach(addRedirectRule);

    } else if (redirectConfig.enabled === true && redirectConfig.links && redirectConfig.links.length) {
        // support old format for redirects
        redirectConfig.links.forEach(processOldRedirectFormat);
    }

    if (redirectConfig.enableCaptureWindowOpen === true && WAT.components.dialogView) {
        WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", loadWindowOpenSpy);
        WAT.components.dialogView.addEventListener("MSWebViewDOMContentLoaded", loadWindowCloseSpy);
        //WAT.components.dialogView.addEventListener("MSWebViewNavigationStarting", dialogViewNavigationStarting);

        WAT.components.webView.addEventListener("MSWebViewScriptNotify", handleWindowOpen);
        //WAT.components.dialogView.addEventListener("MSWebViewScriptNotify", handleWindowClose);
        WAT.components.webView.addEventListener("MSWebViewFrameNavigationStarting", handleWindowOpen);

        WAT.components.dialogView.parentNode.addEventListener("click", closeModalContent);
    }
};

loadWindowOpenSpy = function () {
    var scriptString, exec;

    scriptString =
    "(function() {\n" +
        "var match, " +
            "openWindow = window.open;\n" +
        "window.open = function() {\n" +
            "console.log('intercepted window.open going to: ' + arguments[0]);\n" +
            "match = false;\n";

    // see if the request URL matches a redirect rule...
    redirectRules.forEach(function (rule) {
        if (rule.action === "modal") {
            scriptString += "if (" + rule.regex + ".test(arguments[0])) { match = true; }\n";
        }
    });

    scriptString +=
            "if (match) {\n" +
                "if (window.location.protocol === 'https:') {\n" +
                    "window.external.notify('WINDOWOPEN~~' + arguments[0]);\n" +
                "}\n" +
                "else {\n" +
                    "var iframe = document.createElement('iframe');\n" +
                    "iframe.width = 0;\n" +
                    "iframe.height = 0;\n" +
                    "iframe.id = Math.random();\n" +
                    "iframe.onload = function () { this.parentNode.removeChild(this); };\n" +
                    "iframe.src = \"" + WAT.manifest.start_url + "\" + \"?WINDOWOPEN=\" + encodeURIComponent(arguments[0]);\n" +
                    "document.body.appendChild(iframe);\n" +
                "}\n" +
                "return null;\n" +
            "} else {\n" +
                // if none of the redirect rules matched open as normal (external browser)
                "return openWindow.apply(this, Array.prototype.slice.call(arguments));\n" +
            "}\n" +
        "};\n" + // end of window.open override
    "})();";

    exec = WAT.components.webView.invokeScriptAsync("eval", scriptString);
    exec.start();
};

handleWindowOpen = function (e) {
    var url, parsed, path, content;

    url = getUriParameter(e, "WINDOWOPEN");
    if (!url) {
        // oops, this isn't ours
        return;
    }

    logger.log("captured external window.open call to: ", url);

    if (!/^http/.test(url)) {
        if (/^\//.test(url)) {
            // path from root
            parsed = self.parseURL(WAT.manifest.start_url);
            url = parsed.protocol + "//" + parsed.hostname + url;
        } else {
            // relative path
            parsed = self.parseURL(WAT.components.webView.src);
            url = parsed.protocol + "//" + parsed.hostname + parsed.dirpath + url;
        }
    }

    if (WAT.components.closeButton) {
        WAT.components.closeButton.style.display = "block";

        // Hide close button if requested for this URL
        if (WAT.manifest.wat_redirects.enabled === true) {
            redirectRules.forEach(function (rule) {
                if (rule.regex.test(url) && rule.hideCloseButton === true) {
                    WAT.components.closeButton.style.display = "none";
                }
            });
        }
    }

    WAT.components.dialogView.navigate(url);
    WAT.components.dialogView.parentNode.style.display = "block";
};

loadWindowCloseSpy = function (e) {
    var scriptString, exec,
        modalClosed = false;

    WAT.components.dialogView.addEventListener("MSWebViewScriptNotify", handleWindowClose);
    WAT.components.dialogView.addEventListener("MSWebViewFrameNavigationStarting", handleWindowClose);

    // See if we need to close the modal based on URL
    if (redirectConfig.enabled === true) {
        redirectRules.forEach(function (rule) {
            if (rule.action === "modal" && rule.closeOnMatchRegex && rule.closeOnMatchRegex.test(e.uri)) {
                modalClosed = true;
                closeModalContent();
            }
        });
        if (modalClosed) {
            return; // nothing else to do, the modal is closed
        }
    }

    scriptString =
    "(function() {\n" +
        "var closeWindow = window.close;\n" +
        "window.close = function() {\n" +
            "console.log('intercepted window.close');\n" +
            "if (window.location.protocol === 'https:') {\n" +
                "window.external.notify('WINDOWCLOSE~~' + window.location.href);\n" +
            "}\n" +
            "else {\n" +
                "var iframe = document.createElement('iframe');\n" +
                "iframe.width = 0;\n" +
                "iframe.height = 0;\n" +
                "iframe.id = Math.random();\n" +
                "iframe.onload = function () { this.parentNode.removeChild(this); };\n" +
                "iframe.src = \"" + WAT.manifest.start_url + "?WINDOWCLOSE=\" + encodeURIComponent(window.location.href);\n" +
                "document.body.appendChild(iframe);\n" +
            "}\n" +
            "return;\n" +
        "};\n" + // end of window.close override
    "})();";

    exec = WAT.components.dialogView.invokeScriptAsync("eval", scriptString);
    exec.start();
};

var handleWindowClose = function (e) {
    var metadata = getUriParameter(e, "WINDOWCLOSE");

    if (metadata) {
        logger.log("captured external window.close call: ", metadata);

        closeModalContent();
    }
};

closeModalContent = function () {
    WAT.components.dialogView.src = "about:blank";
    WAT.components.dialogView.parentNode.style.display = "none";

    if (redirectConfig.refreshOnModalClose === true) {
        WAT.components.webView.refresh();
    }
};

addRedirectRule = function (rule) {
    var ruleCopy = { original: rule };

    if (!redirectActions[rule.action]) {
        logger.warn("Looks like that is an invalid redirect action... ", rule.action);
        return;
    }

    ruleCopy.pattern = rule.pattern.replace(/\{baseURL\}/g, WAT.manifest.start_url);
    ruleCopy.regex = WAT.convertPatternToRegex(ruleCopy.pattern);

    ruleCopy.action = rule.action;
    ruleCopy.message = rule.message || "";
    ruleCopy.url = (rule.url) ? rule.url.replace(/\{baseURL\}/g, WAT.manifest.start_url) : "";

    ruleCopy.hideCloseButton = rule.hideCloseButton || false;
    ruleCopy.closeOnMatch = rule.closeOnMatch || null;
    if (rule.closeOnMatch) {
        ruleCopy.closeOnMatchRegex = WAT.convertPatternToRegex(rule.closeOnMatch);
    } else {
        rule.closeOnMatchRegex = null;
    }

    logger.info("Adding redirect rule (" + ruleCopy.action + ") with pattern/regex: " + ruleCopy.pattern, ruleCopy.regex);

    redirectRules.push(ruleCopy);
};

processOldRedirectFormat = function (rule) {
    var actionMatch,
        newRule = { action: null, link: rule };

    newRule.pattern = rule.link;
    actionMatch = rule.action.match(/^showMessage\:\s*(.*)/);
    if (actionMatch) {
        newRule.action = "showMessage";
        newRule.message = actionMatch[1];
    } else {
        newRule.action = "redirect";
        newRule.url = rule.action;
    }

    addRedirectRule(newRule);
};

getUriParameter = function (e, parameter) {
    if (e.type === "MSWebViewScriptNotify") {
        var content = e.value.split(/~~/);
        if (content.length === 2 && content[0] === parameter) {
            return content[1];
        }
    }
    else if (e.type === "MSWebViewFrameNavigationStarting") {
        var uriString = e.uri;
        if (uriString.indexOf('?') > -1) {
            uriString = uriString.split('?')[1];
        }

        var queryStringParams = uriString.split('&');
        var length = queryStringParams.length;

        for (var i = 0; i < length; i++) {
            if (queryStringParams[i].indexOf(parameter + '=') > -1) {
                return decodeURIComponent(queryStringParams[i].split(parameter + '=')[1]);
            }
        }
    }

    return null;
};

// redirect rule action handlers

redirectShowMessage = function (rule) {
    logger.log("Showing message: " + rule.message);
    return new Windows.UI.Popups.MessageDialog(rule.message).showAsync();
};

redirectPopout = function (rule, linkUrl) {
    logger.log("Popping out URL to: " + linkUrl);
    return Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(linkUrl));
};

redirectUrl = function (rule) {
    logger.log("Redirecting user to link in app: " + rule.url);

    WAT.components.webView.navigate(rule.url);
};

module.exports = self; // exports

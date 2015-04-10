
"use strict";

var WAT;
var navBarConfig, createNavBarElement, setupNavBar, createNavBarButton, setButtonAction, initUIDeclarations, setStickyBits,
    barActions = {};
var logger = window.console;

// Public API
var self = {
  init: function(WATRef){
    if (!WAT){
        WAT = WATRef;

        navBarConfig = (WAT.manifest.wat_navBar || {});
        createNavBarElement();
        setupNavBar();

        // create the navbar controls from the previously created html
        new WinJS.UI.NavBar(WAT.components.navBar.parentNode);
        new WinJS.UI.NavBarContainer(WAT.components.navBar);

        // WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", setStickyBits);
    }
  }
};

// Private methods
createNavBarElement = function () {

    var div = document.createElement("div");
    div.id = "navBar"
    div.classList.add("customColor");

    var parent = document.createElement("div");
    parent.style.zIndex = WAT.components.webView.style.zIndex + 101;
    parent.appendChild(div);

    document.body.appendChild(parent);
    WAT.components.navBar = div;
};

setupNavBar = function () {
    var needSplitEvent = false,
        navBarEl = WAT.components.navBar;

    //we are checking to see if the elemnt of navbar exists, if it doesn't then we are probably building for phone and we just want to change this setting to false, so that we don't have to change the other code in the app
    //if (!WinJS.UI.NavBarCommand) {
    //    navBarConfig.enabled = false;
    //    navBarEl.enabled = false;
    //}

    // for phone, if navbar is enabled and header is disabled, enable header (disable navbar if you don't want header)
    if (WAT.environment.isWindowsPhone && WAT.manifest.header && !WAT.manifest.header.enabled && navBarConfig.enabled) {
        WAT.manifest.header.enabled = true;
    }

    if (!navBarConfig.enabled || !navBarEl) {
        if (navBarEl && navBarEl.parentNode.parentNode) {
            // we have to remove the WinJS.UI.NavBar control, but the
            // "navBar" option passes in the WinJS.UI.NavBarConatiner
            navBarEl.parentNode.parentNode.removeChild(navBarEl.parentNode);
            navBarEl = null;

            if (WAT.environment.isWindowsPhone) {
                disableNavDrawer();
            }
        }
        return;
    }

    navBarConfig.maxRows = (navBarConfig.maxRows || 1);

    // Add explicit buttons first...
    if (navBarConfig.buttons) {
        navBarConfig.buttons.forEach(function (menuItem) {
            if (WAT.environment.isWindows) {
                var btn = createNavBarButton(menuItem);

                if (btn) {
                    navBarEl.appendChild(btn);
                }
                if (menuItem.children && menuItem.children.length) {
                    needSplitEvent = true;
                }
            }
            else if (WAT.environment.isWindowsPhone) { // initializing navdrawer for phone
                navDrawerInit();
                if (menuItem.icon && menuItem.icon != "" && menuItem.icon.substring(0, 2) != "ms") {
                    menuItem.icon = "ms-appx:///images/enums/" + menuItem.icon + ".png";
                }

                // adding buttons to the navdrawer list
                if (menuItem.children) {
                    navDrawerList.push(menuItem); //TODO: nested items
                    menuItem.children.forEach(function (childItem) {
                        if (WAT.manifest.cortana && WAT.manifest.cortana.navBar) {
                            phraseList.push(childItem.label);  //adding child items to cortana phrases
                        }

                        if (childItem.icon && childItem.icon != "" && childItem.icon.substring(0, 2) != "ms") {
                            childItem.icon = "ms-appx:///images/enums/" + childItem.icon + ".png";
                        }
                        childItem.label = '  ' + childItem.label;
                        navDrawerList.push(childItem);
                    });
                }
                else {
                    if (WAT.manifest.cortana && WAT.manifest.cortana.navBar) {
                        phraseList.push(menuItem.label); //adding to cortana phrases
                    }
                    navDrawerList.push(menuItem);
                }
            }
        });
    }

    // Then any pageElement nav requested by config...
    if (navBarConfig.pageElements && navBarConfig.pageElements.navElements) {

        WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", injectNavbarBuildingQuery);

    } else {
        // If we are not processing webview nav elements then we are ready to process the nav bar UI declarations
        initUIDeclarations();
    }

    // If there was at least one navbar item with children, set up splitt toggle event...
    if (needSplitEvent) {
        navBarEl.addEventListener("splittoggle", function (e) {
            toggleNestedNav(e.detail.navbarCommand, e.detail.opened);
        });
    }
};

createNavBarButton = function (menuItem) {
    var btn = document.createElement("div"),
        hasChildren = !!(menuItem.children && menuItem.children.length),
        options = { label: menuItem.label, icon: menuItem.icon, splitButton: hasChildren };

    btn.setAttribute("role", "menuitem");

    new WinJS.UI.NavBarCommand(btn, options);

    if (hasChildren) {
        // set up nested navigation if children are present
        setupNestedNav(menuItem, btn);
    }

    setButtonAction(btn, menuItem);

    return btn;
};

setButtonAction = function (btn, menuItem) {
    var action = menuItem.action.toLowerCase(),
        data = menuItem.data,
        handler = barActions[action];

    if (!handler) {
        // default handler is webview navigation
        handler = barActions["navigate"];
        data = menuItem.action;
    }

    if (!WAT.isFunction(handler)) {
        // This is a non-operational bar item (maybe nested nav?)
        return;
    }

    if (data === "home") {
        data = WAT.config.baseURL;
    }

    if (action === "back") {
        backButtons.push(btn);
    }

    btn.dataset.barActionData = data;
    //handle children case
    if (menuItem.children && menuItem.children.length) {
        btn.children[0].addEventListener("click", handler);
    } else {

        btn.addEventListener("click", handler);
    }

};

initUIDeclarations = function () {
    //WAT.components.navBar.parentNode.setAttribute("data-win-control", "WinJS.UI.NavBar");
    WAT.components.navBar.setAttribute("data-win-control", "WinJS.UI.NavBarContainer");
    WAT.components.navBar.setAttribute("data-win-options", "{ maxRows: " + navBarConfig.maxRows + " }");
};

setStickyBits = function () {
    var appBarHeight, navHeight,
        height = (parseInt(WAT.components.stage.offsetHeight) || 0);

    WAT.components.webView.removeEventListener("MSWebViewDOMContentLoaded", setStickyBits);

    if (navBarConfig && navBarConfig.enabled === true && navBarConfig.makeSticky) {
        WAT.components.navBar.disabled = false;
        WAT.components.navBar.parentNode.winControl.sticky = true;
        WAT.components.navBar.parentNode.winControl.show();

        WAT.components.navBar.parentNode.winControl.addEventListener("afterhide", function (e) {
            WAT.components.navBar.parentNode.winControl.show();
        });

        navHeight = (parseInt(WAT.components.navBar.parentNode.offsetHeight) || 0);

        height -= navHeight;
        WAT.components.stage.style.paddingTop = '30px';
        WAT.components.stage.style.top = navHeight + "px";
        WAT.components.backButton.parentNode.style.top = navHeight + "px";
    }

    if (WAT.config.appBar && WAT.config.appBar.enabled === true && WAT.config.appBar.makeSticky) {
        WAT.components.appBar.disabled = false;
        WAT.components.appBar.winControl.sticky = true;
        WAT.components.appBar.winControl.show();

        WAT.components.appBar.winControl.addEventListener("afterhide", function (e) {
            WAT.components.appBar.winControl.show();
        });

        appBarHeight = (parseInt(WAT.components.appBar.offsetHeight) || 0);

        height -= appBarHeight;
    }

    // WAT.components.stage.style.height = height + "px";
    // WAT.components.webView.style.height = height + "px";
    // WAT.components.offlineView.style.height = height + "px";
};

module.exports = self; // exports

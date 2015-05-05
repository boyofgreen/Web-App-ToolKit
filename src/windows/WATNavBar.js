
"use strict";
var navDrawerList = new WinJS.Binding.List();
var WAT;
var navBarConfig, createNavBarElement, setupNavBar, createNavBarButton, setButtonAction, initUIDeclarations, setStickyBits,
    navDrawerInit, returnToContent, toggleMenu, itemInvokedHandler, disableNavDrawer, barActions, handleBarEval, handleBarNavigate,
    barActions = {};
var logger = window.console;
var _menuWidth = 300;

// Public API
var self = {
  init: function(WATRef){
    if (!WAT){
        WAT = WATRef;

        barActions = {
            eval: handleBarEval,
            navigate: handleBarNavigate,
            nested: true
        };

        navBarConfig = (WAT.manifest.wat_navBar || {});

        if (!navBarConfig || !navBarConfig.enabled) {
            if (WAT.environment.isWindowsPhone) {
                disableNavDrawer();
            }

            return;
        }

        createNavBarElement();
        setupNavBar();

        if (WAT.environment.isWindows) {
            // create the navbar controls from the previously created html
            new WinJS.UI.NavBar(WAT.components.navBar.parentNode);
            var container = new WinJS.UI.NavBarContainer(WAT.components.navBar);
            container.maxRows = navBarConfig.maxRows;

            WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", setStickyBits);
        }
    }
  }
};

// Private methods
createNavBarElement = function () {
    if (WAT.environment.isWindows) {
        var div = document.createElement("div");
        div.id = "navBar"
        div.classList.add("customColor");

        var parent = document.createElement("div");
        parent.style.zIndex = WAT.components.webView.style.zIndex + 101;
        parent.appendChild(div);

        WAT.components.content.appendChild(parent);
        WAT.components.navBar = div;
    }
    else {
        var parentDiv = document.createElement("div");
        parentDiv.style.zIndex = WAT.components.webView.style.zIndex + 101;
        var navBar = document.createElement("div");
        navBar.id = "navBar";
        navBar.classList.add("customColor");
        parentDiv.appendChild(navBar);
        WAT.components.stage.appendChild(parentDiv);
        WAT.components.navBar = navBar;
    }
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
        data = WAT.manifest.start_url;
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
    WAT.components.navBar.parentNode.setAttribute("data-win-control", "WinJS.UI.NavBar");
    WAT.components.navBar.setAttribute("data-win-control", "WinJS.UI.NavBarContainer");
    WAT.components.navBar.setAttribute("data-win-options", "{ maxRows: " + navBarConfig.maxRows + " }");
};


disableNavDrawer = function () {
    // disabling navDrawer
    var surface = document.getElementById("surface");
    surface.style.display = "block";
    surface.style.width = "100%";
    document.getElementById("hamburger").style.display = "none";
    document.getElementById("search-box").style.display = "none";
    WAT.components.navDrawer = null;
};

    // initializing navdrawer
navDrawerInit = function () {
    document.querySelector(".header .hamburger").addEventListener("click", toggleMenu);
    document.querySelector(".content").addEventListener("click", returnToContent);
    document.querySelector(".viewport").scrollLeft = _menuWidth;
    document.addEventListener("iteminvoked", itemInvokedHandler, false);
};

    // navdrawer scroll
returnToContent = function (e) {
    var viewport = document.querySelector(".viewport");
    if (viewport.scrollLeft < _menuWidth || viewport.scrollLeft >= _menuWidth * 2) {
        viewport.msZoomTo({
            contentX: _menuWidth
        });
    }
};

    // toggles navdrawer
toggleMenu = function (e) {
    var viewport = document.querySelector(".viewport");
    var scrollPos = (viewport.scrollLeft > 0) ? 0 : _menuWidth;
    viewport.msZoomTo({
        contentX: scrollPos
    });
};

    // handles items in the navdrawer
itemInvokedHandler = function (eventObject) {
    eventObject.detail.itemPromise.done(function (invokedItem) {
        switch (invokedItem.data.action) {
            case "home":
                WAT.goToLocation(WAT.manifest.start_url);
                break;
            case "eval":
                var scriptString = "(function() { " + invokedItem.data.data + " })();";
                var exec = WAT.components.webView.invokeScriptAsync("eval", scriptString);
                exec.start();
                break;
            case "back":
                WAT.components.webView.goBack();
                break;
            case "nested":
                break;
            default:
                WAT.goToLocation(invokedItem.data.action);
                break;
        }
        toggleMenu();
    });
};

setStickyBits = function () {


    var appBarHeight, navHeight,
        height = (parseInt(document.body.offsetHeight) || 0);

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

        //TODO: fix for backbutton
        //WAT.components.backButton.parentNode.style.top = navHeight + "px";
    }

    if (WAT.manifest.wat_appBar && WAT.manifest.wat_appBar.enabled === true && WAT.manifest.wat_appBar.makeSticky) {
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

// app and nav bar action handlers

handleBarEval = function () {
    var scriptString, exec;

    scriptString = "(function() { " + this.dataset.barActionData + " })();";

    exec = WAT.options.webView.invokeScriptAsync("eval", scriptString);
    exec.start();
};

handleBarNavigate = function () {
    //if dataset doesn't exist, look for parent, becuse it will be a nested button assignment that is a child
    var url = (this.dataset.barActionData || this.parentNode.dataset.barActionData || WAT.manifest.start_url);
    var target = new Windows.Foundation.Uri(url);
    WAT.components.webView.navigate(target.toString());
};

module.exports = self; // exports

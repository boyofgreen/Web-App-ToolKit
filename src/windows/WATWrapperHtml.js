
"use strict";

var WAT;
var buildForWindows, buildForWindowsPhone;
var createHeaderElement, createStageElement, moveWebView;

var self = {
        init: function (WATRef) {
            if (!WAT) {
                WAT = WATRef;

            if (WAT.environment.isWindows) {
                // build wrapper html for windows
                var content = document.createElement("div");
                content.id = "content";
                document.body.appendChild(content);
                WAT.components.content = content;

                buildForWindows();
                }
            else {
                // build wrapper html for windows phone
                buildForWindowsPhone();
                }
            }
        }
    };

buildForWindows = function () {
        createHeaderElement();
    createStageElement();
    moveWebView();
    };

buildForWindowsPhone = function () {
    // hide cordova app div
    document.getElementsByClassName("app")[0].style.display = "none";

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

    navDrawer.appendChild(searchBox);
    WAT.components.navDrawer = navDrawer;
    surface.appendChild(navDrawer);

    //TODO: WinJS bindings.
    var navDrawerIconTextTemplate = document.createElement("div");
    navDrawerIconTextTemplate.id = "navDrawerIconTextTemplate";
    navDrawerIconTextTemplate.style.display = "none";

    var navDrawerIcontTextItem = document.createElement("div");
    navDrawerIcontTextItem.id = "navDrawerIconTextItem";
    navDrawerIcontTextItem.classList.add("navDrawerIconTextItem");

    var navDrawerIconTextImage = document.createElement("img");
    navDrawerIconTextImage.classList.add("navDrawerIconTestItem-Image");

    var navDrawerIconTextDetail = document.createElement("div");
    navDrawerIconTextDetail.classList.add("navDrawerIconTextItem-Detail");

    navDrawerIcontTextItem.appendChild(navDrawerIconTextImage);
    navDrawerIcontTextItem.appendChild(navDrawerIconTextDetail);

    navDrawerIconTextTemplate.appendChild(navDrawerIcontTextItem);
    navDrawer.appendChild(navDrawerIconTextTemplate);


    // up a level
    var content = document.createElement("div");
    content.id = "content";
    content.classList.add("content");
    document.body.appendChild(content);
    WAT.components.content = content;

    createStageElement();

    var parentDiv = document.createElement("div");
    parentDiv.style.zIndex = WAT.components.webView.style.zIndex + 101;
    var navBar = document.createElement("div");
    navBar.id = "navBar";
    navBar.classList.add("customColor");
    parentDiv.appendChild(navBar);
    WAT.components.stage.appendChild(parentDiv);
    WAT.components.navBar = navBar;

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

// Windows Phone Wrapper HTML functions



module.exports = self; // exports


"use strict";

var WAT;
var buildForWindows, buildForWindowsPhone;
var createHeaderElement, createStageElement, moveWebView;

var self = {
    init: function(WATRef){
        if (!WAT){
            WAT = WATRef;

            if (WAT.environment.isWindows) {
                // build wrapper html for windows
                WAT.components.content = document.getElementById("content");
                buildForWindows();
            }
            else{
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
    // TODO.

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

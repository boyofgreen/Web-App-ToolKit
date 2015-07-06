# Windows 10 experimental branch

This is an experimental branch to analyze and find fixes to the breaking changes introduced by WinJS 4.

[WinJS 4 breaking changes](https://github.com/winjs/winjs/wiki/changelog#breaking-changes)

### Manual changes

1. need to manually add WinJS 4 via nuget and overwrite the existing base.js file in the Windows 10 project.

### General styling conflicts

1. removed base.css style conflicts between WinJS 2 and WinJS 4

### WebAppToolkitPluginProxy.js changes

1. added reference to corresponding WinJS 4 assets (ui.js and css)
1. binding WinJS control after initializing plugin modules.

### WATAppBar.js changes

1. changed the way the control is created in WinJS 4
1. addressed breaking changes
1. set zindex in wrapper-styles.css so that control is visible at all times

### WATNavBar.js changes

1. addressed breaking changes
1. addressed conflicting styles with base.css

### WATShare.js changes

1. always adding share button to the appbar
1. workaround to WinRT error "The parameter is incorrect" when retrieving appId

### WATSettings.js changes

1. replacing settings charm app commands with appbar secondary commands

# Web App Toolkit

The Web App Toolkit is a plugin for creating Windows, Android and iOS apps based on existing web content. It depends on the [Hosted Web App Plugin](http://plugins.cordova.io/#/package/com.manifoldjs.hostedwebapp). Used in the right way, it can facilitate the creation of compelling extensions to your web content for users across platforms.

## Getting Started

The following tutorial requires you to install the [Cordova Command-Line Inteface](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface).

### Hosting a Web Application
The plugin leverages the functionality from the [Hosted WebApp Plugin](http://plugins.cordova.io/#/package/com.manifoldjs.hostedwebapp). The following steps describe how you can create and configure a sample application and use it with the Web App Toolkit.

1. Create a new Cordova application.  
	`cordova create sampleapp yourdomain.sampleapp SampleHostedApp`

1. Go to the **sampleapp** directory created by the previous command.

1. Download or create a [W3C manifest](http://www.w3.org/2008/webapps/manifest/) describing the website to be hosted by the Cordova application and copy this file to its **root** folder, alongside **config.xml**. If necessary, rename the file as **manifest.json**.

	> **Note:** You can find a sample manifest file at the start of this document.

1. Add the **Web App Toolkit** plugin to the project.  
	`cordova plugin add https://github.com/boyofgreen/web-app-toolkit`

1. Add one or more platforms, for example, to support Android.  
	`cordova platform add android`

1. Build the application.  
	`cordova build`

## Features
The following section shows examples of how you can enable the plugin's features in the **manifest.json** file.

The following table describes the supported features for each of the platforms.

|               | **Windows** |   **iOS**   | **Android** |
|:--------------|:-----------:|:-----------:|:-----------:|
|[wat_share](#wat_share)       |   yes   |         |         |
|[wat_customScript](#wat_customscript)|   yes   |   yes   |   yes   |
|[wat_appBar](#wat_appbar)      |   yes   |         |         |
|[wat_navBar](#wat_navbar)      |   yes   |         |         |
|[wat_livetile](#wat_livetile)    |   yes   |         |         |
|[wat_redirects](#wat_redirects)   |   yes   |   yes   |   yes   |
|[wat_settings](#wat_settings)    |   yes   |         |         |
|[wat_styles](#wat_styles)      |   yes   |   yes   |   yes   |
|[wat_header](#wat_header)      |   yes   |         |         |
|[wat_secondaryPin](#wat_secondarypin)|   yes   |         |         |
|[wat_navigation](#wat_navigation)  |   yes   |         |         |


### wat_share

This controls the use of the share charm within the application.

| **Option** | **Description**
|:-----------|:---------------|
| **enabled** | Toggles the share charm functionality on or off (true/false)
| **showButton** |  Toggles visibility of a Share button on the app bar (true/false)
| **buttonText** | Text used for the Share app bar button if it is enabled
| **buttonSection** | This sets the sharebutton into a particular section of the app bar (if you have sections set up) the default is global http://msdn.microsoft.com/en-us/library/windows/apps/Hh700497.aspx
| **title** | Defines the title passed into the share charm
| **url** | Defines a url that is shared via the share contract. You can use {currentURL} to share the current URL of the webview.
| **screenshot** | Enables the sharing of a screenshot (true/false)
| **message** | Defines a message for the share contract contents. You can use {currentURL} to reference the current url or {url} to reference the base url.

#### Example
<pre>
  "wat_share": {
  	"enabled": true,
    "showButton": true,
    "buttonText": "Share",
    "buttonSection": "global",
  	"title": "Web App Tooklit Documentation",
  	"url": "{currentURL}",
  	"screenshot": true,
  	"message": "{url} shared with {appLink} for Windows."
  },
</pre>

### wat_customScript

An array of custom script files stored within the app package that are injected into the DOM. Paths are relative to the root of the app package.

#### Example
<pre>
  "wat_customScript": {
  	"scriptFiles": [
  		"www/js/injection-script-example.js"
  	]
  },
</pre>

### wat_appBar

This controls the application bar at the bottom of the screen.

|**Option**|**Description**|
|:---------|:--------------|
| **enabled** | Toggles the app bar visibility (true/false)
| **makeSticky** |  Toggles whether the app bar is always visible or not (true/false)
| **buttons** | An array of objects, each of which represent a button within the application bar. Each object has three parameters:
| &nbsp;&nbsp;&nbsp;&nbsp; **label** | the text for the button. Leave this blank to omit the text
| &nbsp;&nbsp;&nbsp;&nbsp; **icon** | the icon for the button. A list of available icons is at dev.windows.com. Leave this blank to omit the icon
| &nbsp;&nbsp;&nbsp;&nbsp; **action** | The action for the button. This defines either the url location that the button links to or it can be set to a eval to executes the javascript defined in the 'data' field
| &nbsp;&nbsp;&nbsp;&nbsp; **data** | Javascript that gets executed if the action is set to 'eval'

#### Example
<pre>
  "wat_appBar": {
      "enabled": true,
      "makeSticky": false,
      "buttons": [
          {
              "label":"Help",
              "icon": "help",
              "action": "http://msdn.microsoft.com/help"
          },
          {
              "label":"Join",
              "icon": "contactpresence",
              "action": "http://msdn.microsoft.com/join"
          },
          {
              "label": "Log Message",
              "icon": "edit",
              "action": "eval",
              "data": "console.log('this was fired from within the webview:', window.location.href);"
          }
      ]
  }
</pre>

### wat_navBar

This controls the navigation bar at the top of the screen.

|**Option**|**Description** |
|----------|----------------|
| **enabled** | Toggles the navigation bar visibility (true/false)
| **maxRows** |  Sets the maximum number of rows that are used to display buttons before the nav bar starts paging
| **makeSticky** | Toggles whether the app bar is always visible or not (true/false)
| **buttons** | An array of objects, each of which represent a button within the navigation bar.Each object has three parameters:
| &nbsp;&nbsp;&nbsp;&nbsp; **label** | The text for the button. Leave this blank to omit the text
| &nbsp;&nbsp;&nbsp;&nbsp; **icon** | The icon for the button. A list of available icons is at dev.windows.com. Leave this blank to omit the icon
| &nbsp;&nbsp;&nbsp;&nbsp; **action** | The action for the button. This defines either the url location that the button links to or a special keyword. back Takes the app back to the most recent page. home Takes the app to the base url. nested Allows the inclusion of children node. eval Executes the javascript defined in the 'data' field
| &nbsp;&nbsp;&nbsp;&nbsp; **data** | Javascript that gets executed if the action is set to 'eval'
children An array of nodes that are shown beneath the parent node. Children nodes take the same format as parent nodes. Only used if the parent node's action is set to 'nested'.

#### Example
<pre>
  "wat_navBar": {
      "enabled": true,
      "maxRows": 1,
      "makeSticky": false,
      "buttons": [
          {
              "label": "Back",
              "icon": "back",
              "action": "back"
          },
          {
              "label": "home",
              "icon": "home",
              "action": "home"
          },
          {
          "label": "JSON Reference",
          "icon": "library",
          "action": "nested",
          "children": [
              {
                  "label": "navbar",
                  "icon": "link",
                  "action": "http://wat-docs.azurewebsites.net/Json#navigationbar"
              },
              {
                  "label": "appbar",
                  "icon": "link",
                  "action": "http://wat-docs.azurewebsites.net/Json#applicationbar"
              },
              {
                  "label": "share",
                  "icon": "link",
                  "action": "http://wat-docs.azurewebsites.net/Json#share"
              }
          ]
          },
          {
              "label": "About WAT",
              "icon": "gotostart",
              "action": "http://wat-docs.azurewebsites.net/About"
          },
          {
              "label": "Getting Started",
              "icon": "play",
              "action": "http://wat-docs.azurewebsites.net/GetStarted"
          },
          {
              "label": "Support",
              "icon": "people",
              "action": "http://wat-docs.azurewebsites.net/Support"
          },
          {
              "label": "Log Message",
              "icon": "edit",
              "action": "eval",
              "data": "console.log('this was fired from within the webview:', window.location.href);"
          }
      ]
  },
</pre>


### wat_livetile

This controls the applications live tile notifications on the users start screen.

|**Option**|**Description**|
|----------|---------------|
| **enabled** | Toggles the live tile functionality (true/false)
| **periodicUpdate** | Number which defines how often the tile updates based on the PeriodicUpdateRecurrence enumeration. Valid values are 0, 1, 2, 3 or 4. 0 is most frequent (half an hour), 4 is the least frequent (daily)
| **enableQueue** | Toggles multiple live tile updates on or off. When set to true the live tile on the start screen will cycle through muliple tile updates either via the RSS feed or multple push notification updates. (true/false)
| **tilePollFeed** | The url for the RSS feed that will drive the live tile updates. This can be any RSS feed.

#### Example
<pre>
  "wat_livetile": {
      "enabled": true,
      "periodicUpdate": "1",
      "enableQueue": true,
      "tilePollFeed": "http://wat-docs.azurewebsites.net/feed"
  }
</pre>

### wat_redirects

Enables you to specify which urls remain inside the app and which ones open in the browser. This feature is useful for those users who are already using the Web App Template and want to keep their configuration file unmodified.

|**Option** | **Description** |
|-----------|-----------------|
| **enabled** | Toggles the redirect functionality (true/false)
| **enableCaptureWindowOpen** | This captures popups (new windows) think about this as a way to catch facebook logins and things like that that need to happen in the app, once this value is enabled, you can control this on each of the redirects (true/false)
| **refreshOnModalClose** | If you need to have the app refresh when this model closes, (like in a login scenario) set this to true (true/false)
| **rules** | An array of objects, each of which represent a re-direction. Each object has three parameters:
| &nbsp;&nbsp;&nbsp;&nbsp; **pattern** | The pattern that the rule should match to take effect
| &nbsp;&nbsp;&nbsp;&nbsp; **action** | The action associated with this operation, this can be one of four options showMessage, popout, redirect or modal.
| &nbsp;&nbsp;&nbsp;&nbsp; **url** | The url to redirect to if action is set to url
| &nbsp;&nbsp;&nbsp;&nbsp; **message** | The message that is used if the action is set to showMessage
| &nbsp;&nbsp;&nbsp;&nbsp; **hideCloseButton** | Hides close button on modal windows
| &nbsp;&nbsp;&nbsp;&nbsp; **closeOnMatch** | A url that when it is loaded, it forces the modal to close (usefull for login scenario)

#### Example
<pre>
  "wat_redirects": {
    "enabled": true,
    "enableCaptureWindowOpen": true,
    "refreshOnModalClose": true,
    "rules": [
  	    {
  		    "pattern": "http://getbootstrap.com?",
  		    "action": "showMessage",
  		    "message": "Sorry, but you can't access this feature in the native app, please visit us online at http://wat-docs.azurewebsites.net"
  	    },
  	    {
  		    "pattern": "\*.microsoft.com*",
  		    "action": "showMessage",
  		    "message": "Redirecting you to the Microsoft website..."
  	    },
  	    {
  		    "pattern": "http://msdn.microsoft.com/\*",
  		    "action": "popout"
  	    },
  	    {
  		    "pattern": "{baseURL}/Json#search",
  		    "action": "redirect",
  		    "url": "http://bing.com"
  	    },
  	    {
  		    "pattern": "\*/drive_api/calculator/login",
  		    "action": "modal",
  		    "hideCloseButton": true,
  		    "closeOnMatch": "\*/drive_api/calculator/complete_login"
  	    }
      ]
  },
</pre>


### wat_settings

This controls the use of the settings charm within the application.

|**Option**| **Description**|
|----------|----------------|
| **enabled** | Toggles the settings charm functionality (true/false)
| **privacyUrl** | Defines a url link to the application's privacy policy. A privacy policy is typically required for app to pass store certification.
| **items** | Defines an array of item that are used in the settings charm
| **title** | Defines the text for the settings item
| **page** | Defines the url for the settings item
| **loadInApp** | Defines whether the url is opened in the app or the browser (true/false)

#### Example
<pre>
  "wat_settings": {
  "enabled": true,
  "privacyUrl": "http://wat-docs.azurewebsites.net/Privacy",
  "items": [
      {
  	    "title": "Support",
  	    "page": "http://wat-docs.azurewebsites.net/Support",
  	    "loadInApp": true
      },
      {
  	    "title": "Codeplex Site",
  	    "page": "http://www.codeplex.com"
      }
  ]
  },
</pre>


### wat_styles
This allows the user to configure the application's view of their website.


|**Option**|**Description**|
|----------|---------------|
|**setViewport**| (_Windows only_) Toggles whether the CSS is created to set the –ms-viewport setting (true/false) |
|**targetWidth**| (_Windows only_) The target width value that is passed into viewport settings (pixels). This can be blank. NOTE: do not use this for websites that already have a responsive base.
|**targetHeight**| (_Windows only_) The target height value that is passed into viewport settings (pixels). This can be blank. NOTE: do not use this for websites that already have a responsive base.
|**suppressTouchAction**| (_Windows only_) Toggles whether the top level touch events are surpressed or not. This is quite helpful with SPA where you don’t want to be able to see scrolling or ruberbanding of the page (true/false)
|**hiddenElements**| An array of strings that reference HTML elements. This enables you to hide any website HTML elements from your application. This is ideal for removing any unwanted top navigation, footers etc from the application view
|**backButton**| (_Windows only_) An array of style rules that are applied to the back button
|**wrapperCssFile**|(_Windows only_) A path to the /css/wrapper-styles.css file. This file applies styles to the native aspects of the app such as app bars, back button etc. Generally speaking you should not need to change this
|**customCssFile**| A path to the /css/injected-styles.css file. This file injects styles into the web view control and can overide CSS within the website itself. Generally speaking you should not need to change this
|**customCssString**| This enables you to embed CSS styles which get inserted over the existing styles on your website. This is great for adjusting the style of the site when it is presented as an application. This can be used as an alterntive to the injected-styles.css.

#### Example
<pre>
  "wat_styles": {
      "setViewport": true,
      "targetWidth": "",
      "targetHeight": "800px",
      "suppressTouchAction": false,
      "extendedSplashScreenBackground": "\#464646",
      "hiddenElements":[
  	    "header", ".bs-header"
      ],
      "backButton": {
  	    "borderColor": "\#FFFFFF",
  	    "color": "\#FFFFFF"
      },
      "wrapperCssFile": "/css/wrapper-styles.css",
      "customCssFile": "/css/injected-styles.css",
      "customCssString": "body {padding:0;font-size: 14pt;}"
  },
</pre>

### wat_header
This enables use of a native page header within the application. This can make the app appear less like a website when use in conjunction with hiding the website's header elements.


|**Option**|**Description**|
|----------|---------------|
|**enabled**| Toggles the header on or off (true/false)
|**backgroundColor**| A hex coe that defines tha background colour for the header
|**logo**| The path to an image that is used as a logo in the header. This is only used if the title is disabled
|**title**| Settings that control the title text that is used in the header. The text is taken from the Title metadata of the page that is being displayed
|**enabled**| Toggles the title text functionality (true/false)
|**displayOnHomePage**| Toggles whether to display the title text on the home page. If false, the title text will still be applied to all other pages (true/false)

#### Example
<pre>
  "wat_header": {
      "enabled": true,
      "backgroundColor": "\#7fba00",
      "logo": "/images/widelogo.scale-100.png",
      "title": {
          "enabled": true,
          "displayOnHomePage": false
      }
  },
</pre>

### wat_secondaryPin
This option sets the secondary pin functionality in the app bar.

|**Option**|**Description**
|----------|---------------|
|**enabled**| Toggles the secondary pin functionality (true/false)
|**buttonText**| Text that is used on the pin button
|**tileTextTheme**| The visual theme for the tile (light/dark)
|**buttonSection**| This sets the sharebutton into a particular section of the app bar (if you have secions set up) the default is global http://msdn.microsoft.com/en-us/library/windows/apps/Hh700497.aspx
|**squareImage**| A path to a square image that is used for secondary tiles
|**wideImage**| A path to a wide image that is used for secndary tiles

#### Example
<pre>
  "wat_secondaryPin": {
      "enabled": true,
  	  "buttonText": "Pin It!",
      "tileTextTheme": "light",
      "buttonSection": "global",
  	  "squareImage": "/images/logo.scale-100.png",
  	  "wideImage": "/images/widelogo.scale-100.png"
  },
</pre>

### wat_navigation
Controls options on how users navigate around the app

#### Example
<pre>
  "wat_navigation": {
      "hideOnPageBackButton": false,
      "hideBackButtonOnMatch": ["http://www.wat.com/privacy.htm","{baseURL}/contactus/"],
      "pageLoadingPartial": "/template/partials/page-loading.html"
  }
</pre>

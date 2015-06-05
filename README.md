# Web App Toolkit

The Web App Toolkit is a plugin for creating Windows, Android and iOS apps based on existing web content. It depends on the ManifoldCordova plugin. Used in the right way, it can facilitate the creation of compelling extensions to your web content for users across platforms. However, there are several guidelines and best practices to get the best use from the plugin.

## Getting Started

The following tutorial requires you to install the [Cordova Command-Line Inteface](http://cordova.apache.org/docs/en/4.0.0/guide_cli_index.md.html#The%20Command-Line%20Interface).

### Hosting a Web Application
The plugin leverages the functionality from the ManifoldCordova plugin. The following steps describe how you can create and configure a sample application and use it with the Web App Toolkit.

1. Create a new Cordova application.  
	`cordova create sampleapp yourdomain.sampleapp SampleHostedApp`

1. Go to the **sampleapp** directory created by the previous command.

1. Download or create a [W3C manifest](http://www.w3.org/2008/webapps/manifest/) describing the website to be hosted by the Cordova application and copy this file to its **root** folder, alongside **config.xml**. If necessary, rename the file as **manifest.json**.

	> **Note:** You can find a sample manifest file at the start of this document.

1. Add the **Web App Toolkit** plugin to the project.  
	`cordova plugin add com-microsoft-webapptoolkit`

1. Add one or more platforms, for example, to support Android.  
	`cordova platform add android`

1. Build the application.  
	`cordova build`

## Features


### wat_share

#### Example
<pre>
  "wat_share": {
  	"enabled": true,
      "showButton": true,
      "buttonText": "Share",
      "buttonSection": "global",
  	"title": "WAT Documentation",
  	"url": "{currentURL}",
  	"screenshot": true,
  	"message": "{url} shared with {appLink} for Windows Phone and Windows 8 Store apps."
  },
</pre>

### wat_customScript
An array of custom script files stored within the app package that are injected into the DOM. Paths are relative to the root of the app package.

#### Example
<pre>
  "wat_customScript": {
  	"scriptFiles": [
  		"injection-script-example.js"
  	]
  },
</pre>

### wat_appBar
This controls the application bar at the bottom of the screen.

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

#### Example
<pre>
  "redirects": {
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


### wat_styles
This allows the user to configure the application's view of their website.

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

#### Example
<pre>
  "secondaryPin": {
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


## Features table

The following table describes the supported features for each of the platforms.

|               | **Windows** |   **iOS**   | **Android** |
|:--------------|:------------|:------------|:------------|
|wat_navigation  |   yes   |         |         |
|wat_share       |   yes   |         |         |
|wat_customScript|   yes   |   yes   |   yes   |
|wat_appBar      |   yes   |         |         |
|wat_navBar      |   yes   |         |         |
|wat_livetile    |   yes   |         |         |
|wat_redirects   |   yes   |   yes   |   yes   |
|wat_settings    |   yes   |         |         |
|wat_styles      |   yes   |   yes   |   yes   |
|wat_header      |   yes   |         |         |
|wat_secondaryPin|   yes   |         |         |

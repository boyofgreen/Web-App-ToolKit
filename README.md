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

### wat_navigation

### wat_share

### wat_customScript
An array of custom script files stored within the app package that are injected into the DOM. Paths are relative to the root of the app package.


### wat_appBar
This controls the application bar at the bottom of the screen.

### wat_navBar
This controls the navigation bar at the top of the screen.

### wat_livetile
This controls the applications live tile notifications on the users start screen.

### wat_redirects
Enables you to specify which urls remain inside the app and which ones open in the browser. This feature is useful for those users who are already using the Web App Template and want to keep their configuration file unmodified.

### wat_styles
This allows the user to configure the application's view of their website.

### wat_header
This enables use of a native page header within the application. This can make the app appear less like a website when use in conjunction with hiding the website's header elements.

### wat_secondaryPin
This option sets the secondary pin functionality in the app bar.

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

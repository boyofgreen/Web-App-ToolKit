# Windows 10 + WinJS 4

The latest bits focus on upgrading the toolkit to WinJS 4, provide fixes to issues in Windows 10 and provide backward compatiblity for Windows 8.1. If you wish to use a version exclusively for Windows 8.1 + WinJS 2, you may look for the **winjs-2** tag.

[WinJS 4 breaking changes](https://github.com/winjs/winjs/wiki/changelog#breaking-changes)

### Manual changes

1. need to manually add WinJS 4 via nuget and overwrite the existing base.js file in the Windows 10 project.
1. Changing the TargetDeviceFamily values to 10.0069.0 in the appxmanifest.

### General styling conflicts

1. removed base.css style conflicts between WinJS 2 and WinJS 4

### WebAppToolkitPluginProxy.js changes

1. added reference to corresponding WinJS 4 assets (ui.js and css)
1. binding WinJS controls after initializing plugin modules.

### WATAppBar.js changes

1. changed the way the control is created in WinJS 4
1. addressed breaking changes
1. set zindex in wrapper-styles.css so that control is visible at all times

### WATNavBar.js changes

1. addressed breaking changes
1. addressed conflicting styles with base.css
1. replacing old custom navdrawer with WinJS's SplitView control in Windows Phone

### WATShare.js changes

1. always adding share button to the appbar
1. workaround to WinRT error "The parameter is incorrect" when retrieving appId (using CurrentAppSimulator instead of CurrentApp)

### WATSettings.js changes

1. replacing settings charm app commands with appbar secondary commands

#import <Cordova/CDVPlugin.h>
#import "CDVHostedWebApp.h"
#import "WATInjectionModule.h"
#import "WATRedirectsModule.h"
#import "WATNavigationModule.h"

#define kNavigationBarHeight 55.0

#define kCDVHostedWebAppWebViewDidStartLoad @"CDVHostedWebAppWebViewDidStartLoad"
#define kCDVHostedWebAppWebViewDidFinishLoad @"CDVHostedWebAppWebViewDidFinishLoad"
#define kCDVHostedWebAppWebViewDidFailLoadWithError @"CDVHostedWebAppWebViewDidFailLoadWithError"
#define kCDVHostedWebAppWebViewShouldStartLoadWithRequest @"CDVHostedWebAppWebViewShouldStartLoadWithRequest"

#define kModuleConstantsWebViewDidFinishLoad @"WebViewDidFinishLoad"
#define kModuleConstantsWebViewShouldStartLoadWithRequest @"WebViewShouldStartLoadWithRequest"

@interface CDVWebAppToolkit : CDVPlugin {
    WATManifest *manifest;
    UINavigationItem* navItem;
}

@property (nonatomic, retain) WATManifest* manifest;
@property (nonatomic, retain) UINavigationItem* navItem;

@end

#import <Cordova/CDVPlugin.h>
#import "CDVHostedWebApp.h"
#import "WATInjectionModule.h"

#define kCDVHostedWebAppWebViewDidStartLoad @"CDVHostedWebAppWebViewDidStartLoad"
#define kCDVHostedWebAppWebViewDidFinishLoad @"CDVHostedWebAppWebViewDidFinishLoad"
#define kCDVHostedWebAppWebViewDidFailLoadWithError @"CDVHostedWebAppWebViewDidFailLoadWithError"
#define kCDVHostedWebAppWebViewShouldStartLoadWithRequest @"CDVHostedWebAppWebViewShouldStartLoadWithRequest"

#define kModuleConstantsWebViewDidFinishLoad @"WebViewDidFinishLoad"
#define kModuleConstantsWebViewShouldStartLoadWithRequest @"WebViewShouldStartLoadWithRequest"

@interface CDVWebAppToolkit : CDVPlugin {
    WATManifest *manifest;
}

@property (nonatomic, retain) WATManifest* manifest;

@end

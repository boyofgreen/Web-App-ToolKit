#import "CDVWebAppToolkit.h"
#import <Cordova/CDV.h>
#import "WATManifest.h"

@interface CDVWebAppToolkit ()

@property WATInjectionModule *injectionModule;

@end

@implementation CDVWebAppToolkit

@synthesize manifest;

- (void)pluginInitialize
{
    [super pluginInitialize];

    // observe notifications from hosted app plugin to detect when manifest is loaded
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(initializeFromManifestNotification:)
                                                 name:kManifestLoadedNotification
                                               object:nil];

    // observe notifications from webview when page starts loading
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(webViewDidStartLoad:)
                                                 name:kCDVHostedWebAppWebViewDidStartLoad
                                               object:nil];

    // observe notifications from webview when page starts loading
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(webViewDidFinishLoad:)
                                                 name:kCDVHostedWebAppWebViewDidFinishLoad
                                               object:nil];

    // observe notifications from webview when page fails loading
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(webViewShouldStartLoadWithRequest:)
                                                 name:kCDVHostedWebAppWebViewShouldStartLoadWithRequest
                                               object:nil];

    CDVHostedWebApp* plugin = [self.commandDelegate getCommandInstance:@"HostedWebApp"];

    [self initializeWithManifest:[plugin manifest]];

    self.injectionModule = [[WATInjectionModule alloc] initWithPlugin:self];
}


// Handles notifications from the Hosted app plugin
- (void)initializeFromManifestNotification:(NSNotification*)notification
{
    NSDictionary* manifestData = [notification object];

    if ([[notification name] isEqualToString:kManifestLoadedNotification]) {
        NSLog (@"Received a manifest loaded notification.");

        if ((manifestData != nil) && [manifestData isKindOfClass:[NSDictionary class]]) {
            [self initializeWithManifest:manifestData];
        }
    }
}

- (void)initializeWithManifest:(NSDictionary*)manifestData {
    self.manifest = [[WATManifest alloc] initFromManifest:manifestData];
}

- (void)webViewShouldStartLoadWithRequest:(NSNotification*)notification {
    if ([[notification name] isEqualToString:kCDVHostedWebAppWebViewShouldStartLoadWithRequest]) {
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:kModuleConstantsWebViewShouldStartLoadWithRequest object:notification.object]];
    }
}

- (void)webViewDidStartLoad:(NSNotification*)notification
{
    if ([[notification name] isEqualToString:kCDVHostedWebAppWebViewDidStartLoad]) {
        
    }
}

- (void)webViewDidFinishLoad:(NSNotification*)notification
{
    if ([[notification name] isEqualToString:kCDVHostedWebAppWebViewDidFinishLoad]) {
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:kModuleConstantsWebViewDidFinishLoad object:nil]];
    }
}

@end

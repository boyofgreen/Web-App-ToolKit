#import "CDVWebAppToolkit.h"
#import <Cordova/CDV.h>
#import "WATManifest.h"

@interface CDVWebAppToolkit ()

@property NSMutableArray *modules;

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
                                             selector:@selector(webViewDidFinishLoad:)
                                                 name:kCDVHostedWebAppWebViewDidFinishLoad
                                               object:nil];


    CDVHostedWebApp* plugin = [self.commandDelegate getCommandInstance:@"HostedWebApp"];

    [self initializeWithManifest:[plugin manifest]];

    if (self.modules == nil) {
        self.modules = [[NSMutableArray alloc] init];
        [self.modules addObject:[[WATInjectionModule alloc] initWithPlugin:self]];
        [self.modules addObject:[[WATRedirectsModule alloc] initWithPlugin:self]];
    }
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

- (void)webViewDidFinishLoad:(NSNotification*)notification
{
    if ([[notification name] isEqualToString:kCDVHostedWebAppWebViewDidFinishLoad]) {
        [[NSNotificationCenter defaultCenter] postNotification:[NSNotification notificationWithName:kModuleConstantsWebViewDidFinishLoad object:nil]];
    }
}

- (BOOL) shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType {
    for (WATModule *module in self.modules) {
        if ([module shouldOverrideLoadWithRequest:request navigationType:navigationType]) {
            return YES;
        }
    }
    
    return NO;
}

@end

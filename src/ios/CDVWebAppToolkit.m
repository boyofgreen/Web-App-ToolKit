#import "CDVWebAppToolkit.h"
#import <Cordova/CDV.h>
#import "WATManifest.h"

@interface CDVWebAppToolkit ()

@property NSMutableArray *modules;

@end

@implementation CDVWebAppToolkit

@synthesize manifest, navItem;

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
    
    [self setNavBar];
    
    if (self.modules == nil) {
        self.modules = [[NSMutableArray alloc] init];
        [self.modules addObject:[[WATInjectionModule alloc] initWithPlugin:self]];
        [self.modules addObject:[[WATRedirectsModule alloc] initWithPlugin:self]];
        [self.modules addObject:[[WATNavigationModule alloc] initWithPlugin:self]];
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

- (void) setNavBar {
    if (!self.manifest.navigationConfig.hideOnPageBackButton) {
        UINavigationBar *navBar = [[UINavigationBar alloc] initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, kNavigationBarHeight)];
    
        self.navItem = [[UINavigationItem alloc] init];
    
        [navBar pushNavigationItem:self.navItem animated:NO];
        [[[self viewController] view] addSubview: navBar];
    
        // Resize the webview
        [self.webView sizeToFit];
        [self.webView setFrame:CGRectMake(self.webView.frame.origin.x, self.webView.frame.origin.y + kNavigationBarHeight, self.webView.frame.size.width, self.webView.frame.size.height - kNavigationBarHeight)];
    }
}

@end

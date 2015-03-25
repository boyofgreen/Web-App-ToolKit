#import "CDVWebAppToolkit.h"
#import <Cordova/CDV.h>
#import "CDVHostedWebApp.h"
#import "WATManifest.h"

@interface CDVWebAppToolkit ()

@property WATManifest* manifest;

@end

@implementation CDVWebAppToolkit

- (void)pluginInitialize
{
    [super pluginInitialize];

    // observe notifications from hosted app plugin to detect when manifest is loaded
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(initializeFromManifestNotification:)
                                                 name:kManifestLoadedNotification
                                               object:nil];

    CDVHostedWebApp *plugin = [self.commandDelegate getCommandInstance:@"HostedWebApp"];

    [self initializeWithManifest:[plugin manifest]];

    [self addActionBar];

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

- (void)share:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* pluginResult = nil;

    NSString* url = [command.arguments objectAtIndex:0];
    NSString* message = [command.arguments objectAtIndex:1];

    [self shareUrl:url withMessage:message];
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)shareUrl:(NSString *)url withMessage:(NSString *)message {
    NSURL *myWebsite = [NSURL URLWithString:url];

    NSArray *objectsToShare;
    if (message) {
         objectsToShare = @[message, myWebsite];
    } else {
        objectsToShare = @[myWebsite];
    }

    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:objectsToShare applicationActivities:nil];

    NSArray *excludeActivities = @[UIActivityTypeAirDrop,
                                   UIActivityTypePrint,
                                   UIActivityTypeAssignToContact,
                                   UIActivityTypeSaveToCameraRoll,
                                   UIActivityTypeAddToReadingList,
                                   UIActivityTypePostToFlickr,
                                   UIActivityTypePostToVimeo];

    activityVC.excludedActivityTypes = excludeActivities;

    [[self viewController] presentViewController:activityVC animated:YES completion:nil];
}

- (void)shareAction {
    WATShareConfig* shareConfig = [[self manifest] shareConfig];

    if (shareConfig && [shareConfig enabled]) {
        NSString *currentURL;

        if ([kCurrentURL isEqualToString:[shareConfig url]]) {
            currentURL = self.webView.request.URL.absoluteString;
        } else {
            currentURL = [shareConfig url];
        }

        [self shareUrl:currentURL withMessage:[shareConfig message]];
    }
}

- (void)addActionBar {
    UINavigationBar *navBar = [[UINavigationBar alloc] initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, 55.0)];

    UINavigationItem *item = [[UINavigationItem alloc] initWithTitle:@"App Title"];
    item.hidesBackButton = YES;

    UIBarButtonItem *leftButton = [[UIBarButtonItem alloc] initWithTitle:@"Back"
                                                                   style:UIBarButtonItemStyleDone
                                                                  target:self
                                                                  action:@selector(navigateBack)];

    item.leftBarButtonItem = leftButton;

    WATShareConfig* shareConfig = [[self manifest] shareConfig];
    if (shareConfig && [shareConfig enabled]) {
        UIBarButtonItem *rightButton = [[UIBarButtonItem alloc] initWithTitle:[shareConfig buttonText]
                                                                        style:UIBarButtonItemStyleDone
                                                                       target:self
                                                                       action:@selector(shareAction)];
        item.rightBarButtonItem = rightButton;
    }

    [navBar pushNavigationItem:item animated:NO];

    [[[self viewController] view] addSubview: navBar];
}

- (void) navigateBack {
    if ([self.webView canGoBack]) {
        [self.webView goBack];
    }
}


@end

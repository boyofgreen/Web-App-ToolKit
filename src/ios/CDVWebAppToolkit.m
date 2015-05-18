#import "CDVWebAppToolkit.h"
#import <Cordova/CDV.h>
#import "CDVHostedWebApp.h"
#import "WATManifest.h"

#define kNavigationBarHeight 55.0

@interface CDVWebAppToolkit ()

@property WATManifest* manifest;
@property UINavigationItem *item;
@property UIBarButtonItem *backButton;

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

- (void)shareUrl:(NSString *)url withMessage:(NSString *)message withImage:(BOOL) addImage {
    NSURL *myWebsite = [NSURL URLWithString:url];

    NSMutableArray *objectsToShare = [[NSMutableArray alloc] init];

    if (message) {
        [objectsToShare addObject:message];
    }

    [objectsToShare addObject:myWebsite];

    if (addImage) {
        UIView* view = [[self viewController] view];
        UIGraphicsBeginImageContextWithOptions(view.bounds.size, NO, 0);
        [view drawViewHierarchyInRect:view.bounds afterScreenUpdates:YES];
        UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        [objectsToShare addObject:image];
    }

    UIActivityViewController *activityVC = [[UIActivityViewController alloc] initWithActivityItems:objectsToShare applicationActivities:nil];

    //NSArray *excludeActivities = @[UIActivityTypeAirDrop,
    //                               UIActivityTypePrint,
    //                               UIActivityTypeAssignToContact,
    //                               UIActivityTypePostToVimeo];

    //activityVC.excludedActivityTypes = excludeActivities;

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

        [self shareUrl:currentURL withMessage:[shareConfig message] withImage:[shareConfig screenshot]];
    }
}

- (void)share:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* pluginResult = nil;

    NSString* url = [command.arguments objectAtIndex:0];
    NSString* message = [command.arguments objectAtIndex:1];
    bool addImage = [[command.arguments objectAtIndex:2] boolValue];

    [self shareUrl:url withMessage:message withImage:addImage];

    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)webViewDidStartLoad:(NSNotification*)notification
{
    if ([[notification name] isEqualToString:kCDVHostedWebAppWebViewDidStartLoad]) {
    }
}


- (void)webViewDidFinishLoad:(NSNotification*)notification
{
    if ([[notification name] isEqualToString:kCDVHostedWebAppWebViewDidFinishLoad]) {
        [self showBackButton:[self.webView canGoBack]];

        if(self.manifest != nil) {
            if(self.manifest.scriptInjection.enabled) {
                [self injectJavascript];
            }

            if(self.manifest.styleInjection.enabled) {
                [self injectStylesheet];
            }
        }
    }
}


- (void)addActionBar {
    UINavigationBar *navBar = [[UINavigationBar alloc] initWithFrame:CGRectMake(0, 0, [UIScreen mainScreen].bounds.size.width, kNavigationBarHeight)];

    self.item = [[UINavigationItem alloc] initWithTitle:[self manifest].name];
    self.item.hidesBackButton = YES;

    [self.webView layoutMarginsDidChange];

    // Add share button if its enabled
    WATShareConfig* shareConfig = [[self manifest] shareConfig];
    if (shareConfig && [shareConfig enabled]) {
        UIBarButtonItem *rightButton = [[UIBarButtonItem alloc] initWithTitle:[shareConfig buttonText]
                                                                        style:UIBarButtonItemStyleDone
                                                                       target:self
                                                                       action:@selector(shareAction)];
        self.item.rightBarButtonItem = rightButton;
    }

    [navBar pushNavigationItem:self.item animated:NO];

    [[[self viewController] view] addSubview: navBar];

    // Resize the webview
    [self.webView sizeToFit];
    [self.webView setFrame:CGRectMake(self.webView.frame.origin.x, self.webView.frame.origin.y + kNavigationBarHeight, self.webView.frame.size.width, self.webView.frame.size.height - kNavigationBarHeight)];
}

- (void) showBackButton:(BOOL)show {
    if (show) {
        if (!self.backButton){
            self.backButton = [[UIBarButtonItem alloc] initWithTitle:@"Back"
                                                          style:UIBarButtonItemStyleDone
                                                         target:self
                                                         action:@selector(navigateBack)];
        }

        self.item.leftBarButtonItem = self.backButton;

    } else {
        self.item.leftBarButtonItem = nil;
    }
}

- (void) navigateBack {
    if ([self.webView canGoBack]) {
        [self.webView goBack];
    }
}

- (NSString *) getContentFromCustomScriptFile:(NSString *)fileName {
    NSString *path = self.manifest.scriptInjection.filePath;
    NSString *partialPath = [NSString stringWithFormat: @"%@%@", path, fileName];

    NSString *fullPath = [self.commandDelegate pathForResource:partialPath];
    fullPath = [fullPath stringByReplacingOccurrencesOfString:@" " withString:@"%20"];

    return [NSString stringWithFormat: @"javascript:( function() { var parent = document.getElementsByTagName('head').item(0);var element = document.createElement('link'); element.type = 'text/css'; element.rel = 'stylesheet'; element.href = '%@';parent.appendChild(element);})()",fullPath];
}

- (NSString *) getContentFromStyleFile:(NSString *)fileName {
    NSString *path = self.manifest.styleInjection.filePath;
    NSString *partialPath = [NSString stringWithFormat: @"%@%@", path, fileName];

    NSString *fullPath = [self.commandDelegate pathForResource:partialPath];
    fullPath = [fullPath stringByReplacingOccurrencesOfString:@" " withString:@"%20"];

    return [NSString stringWithFormat: @"javascript:( function() { var parent = document.getElementsByTagName('head').item(0);var element = document.createElement('script');element.type = 'text/javascript';element.src = '%@';parent.appendChild(element);})()",fullPath];
}

- (NSString *) getScriptFromInlineStyle:(NSString *)styles {
    return [NSString stringWithFormat: @"javascript:( function() { var parent = document.getElementsByTagName('head').item(0);var style = document.createElement('style');style.type = 'text/css';style.appendChild(document.createTextNode('%@'));parent.appendChild(style)})()", styles];
}

- (void)injectJavascript {
    NSString *inlineScript = self.manifest.scriptInjection.customString;
    [[self commandDelegate] evalJs:inlineScript];

    NSArray *files = self.manifest.scriptInjection.scriptFiles;
    for (NSString *value in files) {
        [[self commandDelegate] runInBackground:^{
            [[self commandDelegate] evalJs: [self getContentFromCustomScriptFile:value]];
        }];
    }
}

- (void)injectStylesheet {
    NSString *inlineStyles = self.manifest.styleInjection.customString;
    [[self commandDelegate] evalJs:[self getScriptFromInlineStyle:inlineStyles]];

    NSArray *files = self.manifest.styleInjection.styleFiles;
    for (NSString *value in files) {
        [[self commandDelegate] runInBackground:^{
            [[self commandDelegate] evalJs: [self getContentFromStyleFile:value]];
        }];
    }
}

@end

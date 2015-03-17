#import "CDVWebAppToolkit.h"
#import <Cordova/CDV.h>
#import "CDVConnection.h"

@interface CDVWebAppToolkit ()

@end

@implementation CDVWebAppToolkit

- (void)pluginInitialize
{
  [super pluginInitialize];
}

// receives the parsed manifest from the Javascript side - not implemented
- (void)initialize:(CDVInvokedUrlCommand *)command {
}

@end

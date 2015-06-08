#import <Foundation/Foundation.h>
#import "WATRedirectRulesConfig.h"
#import "PopupViewController.h"
#import "WATManifest.h"
#import "WATModule.h"
#import "Alert.h"

@class CDVWebAppToolkit;

@interface WATRedirectsModule : WATModule
{
    CDVWebAppToolkit* webAppToolkit;
}

@property (nonatomic, strong) CDVWebAppToolkit* webAppToolkit;

- (id)initWithPlugin:(CDVWebAppToolkit *)_webAppToolkit;

@end

#import <Foundation/Foundation.h>
#import "WATManifest.h"
#import "WATModule.h"

@class CDVWebAppToolkit;

@interface WATNavigationModule : WATModule {
    CDVWebAppToolkit* webAppToolkit;
}

@property (nonatomic, strong) CDVWebAppToolkit* webAppToolkit;

- (id)initWithPlugin:(CDVWebAppToolkit *)webAppToolkit;

@end

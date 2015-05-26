#import <Foundation/Foundation.h>
#import "WATManifest.h"

@class CDVWebAppToolkit;

@interface WATInjectionModule : NSObject {
    CDVWebAppToolkit* webAppToolkit;
}

@property (nonatomic, strong) CDVWebAppToolkit* webAppToolkit;

- (id)initWithPlugin:(CDVWebAppToolkit *)webAppToolkit;

@end

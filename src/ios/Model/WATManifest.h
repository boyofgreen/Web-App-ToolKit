#import <Foundation/Foundation.h>
#import "WATScriptInjection.h"
#import "WATStyleInjection.h"
#import "WATRedirectsConfig.h"
#import "WATNavigationConfig.h"

@interface WATManifest : NSObject
{
    NSString *startURL;
    NSString *name;
    WATStyleInjection *styleInjection;
    WATScriptInjection *scriptInjection;
    WATRedirectsConfig *redirectsConfig;
    WATNavigationConfig *navigationConfig;
}

@property (nonatomic, strong, readonly) NSString *startURL;
@property (nonatomic, strong, readonly) NSString *name;

@property (nonatomic, strong, readonly) WATStyleInjection *styleInjection;
@property (nonatomic, strong, readonly) WATScriptInjection *scriptInjection;
@property (nonatomic, strong, readonly) WATRedirectsConfig *redirectsConfig;
@property (nonatomic, strong, readonly) WATNavigationConfig *navigationConfig;

- (id)initFromManifest:(NSDictionary*)manifest;

@end

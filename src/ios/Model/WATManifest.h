#import <Foundation/Foundation.h>
#import "WATScriptInjection.h"
#import "WATStyleInjection.h"

@interface WATManifest : NSObject
{
    NSString *startURL;
    NSString *name;
    WATStyleInjection *styleInjection;
    WATScriptInjection *scriptInjection;
}

@property (nonatomic, strong, readonly) NSString *startURL;
@property (nonatomic, strong, readonly) NSString *name;

@property (nonatomic, strong, readonly) WATStyleInjection *styleInjection;
@property (nonatomic, strong, readonly) WATScriptInjection *scriptInjection;

- (id)initFromManifest:(NSDictionary*)manifest;

@end

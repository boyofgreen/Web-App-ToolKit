#import <Foundation/Foundation.h>
#import "WATShareConfig.h"

@interface WATManifest : NSObject
{
    NSString *startURL;
    NSString *name;
    WATShareConfig *shareConfig;
}

@property (nonatomic, strong, readonly) NSString *startURL;
@property (nonatomic, strong, readonly) NSString *name;
@property (nonatomic, strong, readonly) WATShareConfig *shareConfig;

- (id)initFromManifest:(NSDictionary*)manifest;

@end

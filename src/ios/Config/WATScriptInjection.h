#import <Foundation/Foundation.h>

@interface WATScriptInjection : NSObject
{
    BOOL enabled;
    NSString* customString;
    NSArray* scriptFiles;
}

@property (nonatomic, assign, readonly) BOOL enabled;
@property (nonatomic, strong, readonly) NSString *customString;
@property (nonatomic, strong, readonly) NSArray *scriptFiles;

- (id)initFromManifest:(NSDictionary*)manifest;

@end

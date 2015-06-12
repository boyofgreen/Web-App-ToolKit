#import <Foundation/Foundation.h>

@interface WATStyleInjection : NSObject
{
    BOOL enabled;
    NSString* customString;
    NSString* styleFile;
    NSMutableArray *hiddenElements;
}

@property (nonatomic, assign, readonly) BOOL enabled;
@property (nonatomic, strong, readonly) NSString *customString;
@property (nonatomic, strong, readonly) NSString *styleFile;
@property (nonatomic, strong, readonly) NSMutableArray *hiddenElements;

- (id)initFromManifest:(NSDictionary*)manifest;

@end

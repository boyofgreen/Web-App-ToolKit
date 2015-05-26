#import <Foundation/Foundation.h>

@interface WATStyleInjection : NSObject
{
    BOOL enabled;
    NSString* filePath;
    NSString* customString;
    NSArray* styleFiles;
}

@property (nonatomic, assign, readonly) BOOL enabled;
@property (nonatomic, strong, readonly) NSString *filePath;
@property (nonatomic, strong, readonly) NSString *customString;
@property (nonatomic, strong, readonly) NSArray *styleFiles;

- (id)initFromManifest:(NSDictionary*)manifest;

#define STYLE_FILE_PATH @"css/"

@end

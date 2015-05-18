#import <Foundation/Foundation.h>

@interface WATScriptInjection : NSObject
{
    BOOL enabled;
    NSString* filePath;
    NSString* customString;
    NSArray* scriptFiles;
}

@property (nonatomic, assign, readonly) BOOL enabled;
@property (nonatomic, strong, readonly) NSString *filePath;
@property (nonatomic, strong, readonly) NSString *customString;
@property (nonatomic, strong, readonly) NSArray *scriptFiles;

- (id)initFromManifest:(NSDictionary*)manifest;
- (void) setFilePath:(NSString *) newPath;

#define SCRIPT_FILE_PATH @"js/"

@end

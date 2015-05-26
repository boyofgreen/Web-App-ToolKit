#import "WATScriptInjection.h"

@implementation WATScriptInjection

@synthesize enabled,filePath,customString,scriptFiles;

- (id)initFromManifest:(NSDictionary*) manifestData
{
    self = [super init];

    if (self)
    {
        enabled = NO;
        filePath = SCRIPT_FILE_PATH;

        if (manifestData) {
            if ([manifestData objectForKey:@"customJSString"]) {
              enabled = YES;
              customString = [manifestData objectForKey:@"customJSString"];
            }

            if ([manifestData objectForKey:@"scriptFiles"]) {
              enabled = YES;
              scriptFiles = [manifestData valueForKey:@"scriptFiles"];
            }
        }
    }

    return self;
}

- (id)init
{
    return [self initFromManifest:nil];
}

@end

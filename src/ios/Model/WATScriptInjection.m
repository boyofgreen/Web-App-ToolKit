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

- (void) setFilePath:(NSString *) newPath{
    if([self validatePath:newPath]){
      filePath = newPath;
    }else{
      NSLog(@"The newPath inserted is incorrect or null. Please keep setting your custom files into the default path( www/files/ )");
    }
}

- (BOOL) validatePath:(NSString*)path{

    if (path == nil || [path isEqualToString:@""] == YES || [self matchRegex:path] == NO ) {
        return NO;
    }
    return YES;
}

- (BOOL) matchRegex:(NSString*) path{
    if ([path rangeOfString:@"\\A(?:[0-9a-zA-Z\\_\\-]+\\/)+\\z" options:NSRegularExpressionSearch].location != NSNotFound)
        return YES;
    else
        return NO;
}

@end

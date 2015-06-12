#import "WATStyleInjection.h"

@implementation WATStyleInjection

@synthesize enabled,customString,styleFile,hiddenElements;

- (id)initFromManifest:(NSDictionary*) manifestData
{
    self = [super init];

    if (self)
    {
        enabled = NO;

        if (manifestData) {
            if ([manifestData objectForKey:@"customCssFile"]) {
                enabled = YES;
                styleFile = [manifestData objectForKey:@"customCssFile"];
            }

            if ([manifestData objectForKey:@"customCssString"]) {
                enabled = YES;
                customString = [manifestData objectForKey:@"customCssString"];
            }
            
            if ([manifestData objectForKey:@"hiddenElements"]) {
                enabled = YES;
                hiddenElements = [[NSMutableArray alloc] init];
                
                NSDictionary* elements = [manifestData objectForKey:@"hiddenElements"];
                for (NSDictionary* el in elements) {
                    [hiddenElements addObject:el];
                }
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

#import "WATManifest.h"

@implementation WATManifest

@synthesize startURL,name,shareConfig;

- (id)initFromManifest:(NSDictionary*)manifest
{
    self = [super init];

    if (self)
    {
        if (manifest) {
            startURL = [manifest objectForKey:@"start_url"];

            name = [manifest objectForKey:@"name"];

            NSDictionary* shareData = [manifest objectForKey:@"wat_share"];

            if (shareData) {
                shareConfig = [[WATShareConfig alloc] initFromManifest:shareData];
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

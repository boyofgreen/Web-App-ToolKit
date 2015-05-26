#import "WATManifest.h"

@implementation WATManifest

@synthesize startURL, name, styleInjection, scriptInjection;

- (id)initFromManifest:(NSDictionary*)manifest
{
    self = [super init];

    if (self)
    {
        if (manifest) {
            startURL = [manifest objectForKey:@"start_url"];

            name = [manifest objectForKey:@"name"];

            NSDictionary* styleData = [manifest objectForKey:@"wat_styles"];
            NSDictionary* scriptData = [manifest objectForKey:@"wat_customScript"];

            if (styleData) {
              styleInjection = [[WATStyleInjection alloc] initFromManifest:styleData];
            }

            if (scriptData) {
              scriptInjection = [[WATScriptInjection alloc] initFromManifest:scriptData];
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

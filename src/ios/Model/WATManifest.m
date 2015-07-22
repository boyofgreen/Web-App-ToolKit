#import "WATManifest.h"

@implementation WATManifest

@synthesize startURL, name, styleInjection, scriptInjection, redirectsConfig, navigationConfig;

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
            NSDictionary* redirectsData = [manifest objectForKey:@"wat_redirects"];
            NSDictionary* navigationData = [manifest objectForKey:@"wat_navigation"];

            if (styleData) {
              styleInjection = [[WATStyleInjection alloc] initFromManifest:styleData];
            }

            if (scriptData) {
              scriptInjection = [[WATScriptInjection alloc] initFromManifest:scriptData];
            }
            
            if (redirectsData) {
                redirectsConfig = [[WATRedirectsConfig alloc] initFromManifest:redirectsData withBaseUrl:startURL];
            }
            
            if (navigationData) {
                navigationConfig = [[WATNavigationConfig alloc] initFromManifest:navigationData withBaseUrl:startURL];
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

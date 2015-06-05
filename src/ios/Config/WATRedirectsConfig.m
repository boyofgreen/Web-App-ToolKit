#import "WATRedirectsConfig.h"
#import "WATRedirectRulesConfig.h"

@implementation WATRedirectsConfig

@synthesize enabled, enableCaptureWindowOpen, refreshOnModalClose, rules;

- (id)initFromManifest:(NSDictionary*) manifestData withBaseUrl:(NSString*)baseUrl
{
    self = [super init];
    
    if (self)
    {
        enabled = YES;
        
        if (manifestData) {
            if ([manifestData objectForKey:@"enabled"]) {
                enabled = [[manifestData objectForKey:@"enabled"] boolValue];
            }
            
            if ([manifestData objectForKey:@"enableCaptureWindowOpen"]) {
                enableCaptureWindowOpen = [[manifestData objectForKey:@"enableCaptureWindowOpen"] boolValue];
            }
            
            if ([manifestData objectForKey:@"refreshOnModalClose"]) {
                refreshOnModalClose = [[manifestData objectForKey:@"refreshOnModalClose"] boolValue];
            }

            if ([manifestData objectForKey:@"rules"]) {
                NSDictionary *rulesDict = [manifestData objectForKey:@"rules"];
                
                rules = [[NSMutableArray alloc] initWithCapacity:[rulesDict count]];
                
                NSEnumerator *en = [rulesDict objectEnumerator];
                id object;
                while ((object = [en nextObject])) {
                    NSDictionary *r = (NSDictionary*)object;
                    
                    WATRedirectRulesConfig *rule = [[WATRedirectRulesConfig alloc] initFromManifest:r withBaseUrl:baseUrl];
                    
                    [rules addObject:rule];
                }
            }
        }
    }
    
    return self;
}

- (id)init
{
    return [self initFromManifest:nil withBaseUrl:nil];
}

- (BOOL) hasRules {
    return [rules count] > 0;
}

@end

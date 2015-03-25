#import "WATShareConfig.h"

@implementation WATShareConfig

@synthesize enabled,buttonText,title,url,screenshot,message;

- (id)initFromManifest:(NSDictionary*) manifestData
{
    self = [super init];

    if (self)
    {
        enabled = YES;
        buttonText = @"Share";
        url = kCurrentURL;

        if (manifestData) {
            if ([manifestData objectForKey:@"enabled"]) {
                enabled = [manifestData objectForKey:@"enabled"];
            }

            if ([manifestData objectForKey:@"buttonText"]) {
                buttonText = [manifestData objectForKey:@"buttonText"];
            }

            if ([manifestData objectForKey:@"title"]) {
                title = [manifestData objectForKey:@"title"];
            }

            if ([manifestData objectForKey:@"url"]) {
                url = [manifestData objectForKey:@"url"];
            }

            if ([manifestData objectForKey:@"screenshot"]) {
                screenshot = [manifestData objectForKey:@"screenshot"];
            }

            if ([manifestData objectForKey:@"message"]) {
                message = [manifestData objectForKey:@"message"];
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

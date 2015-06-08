#import "WATModule.h"

@implementation WATModule

- (BOOL) shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    return NO;
}

@end

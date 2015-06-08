#import <Foundation/Foundation.h>

@interface WATModule : NSObject

- (BOOL) shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType;

@end

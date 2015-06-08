#import "WATRedirectsModule.h"
#import "CDVWebAppToolkit.h"

@implementation WATRedirectsModule

@synthesize webAppToolkit;

- (id)initWithPlugin:(CDVWebAppToolkit *)_webAppToolkit {
    self = [super init];

    if (self) {
        if(_webAppToolkit != nil) {
            self.webAppToolkit = _webAppToolkit;
        }
    }

    return self;
}

- (id)init {
    return [self initWithPlugin:nil];
}

- (BOOL) shouldOverrideLoadWithRequest:(NSURLRequest*)request navigationType:(UIWebViewNavigationType)navigationType
{
    if (self.webAppToolkit.manifest.redirectsConfig != nil && self.webAppToolkit.manifest.redirectsConfig.enabled)
    {
        NSString *url = [[request URL] absoluteString];
        NSLog(@"URL request: %@", url);

        for (WATRedirectRulesConfig *rule in self.webAppToolkit.manifest.redirectsConfig.rules)
        {
            NSLog(@"Rule: %@ => \nRegex: %@ \nAction:%@ #%u", rule.pattern, rule.regexPattern, rule.action, (int)rule.actionType );
            if ([rule hasRuleMatchedURL:url])
            {
                NSLog(@"Matched #%u URL:%@", (int)rule.actionType, url);

                switch (rule.actionType)
                {
                    case kModal:
                    {
                        PopupViewController *vc = [[PopupViewController alloc] init];
                        
                        [vc setTitle:webAppToolkit.manifest.name];
                        [vc setRequest:request];
                        [vc setRule:rule];

                        UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:vc];
                        [[self.webAppToolkit viewController] presentViewController:nc animated:YES completion:NULL];

                        break;
                    }
                    case kPopout:
                    {
                        [[UIApplication sharedApplication] openURL:[request URL]]; // opens links in webview in Safari
                         break;
                    }
                    case kShowMessage:
                    {
                        if (rule.message != nil)
                        {
                            [self toast:rule.message];
                        }
                        else
                        {
                            [self toast:@"Not accessible"];
                        }
                        break;
                    }
                    case kRedirect:
                    {
                        if (rule.url != nil)
                        {
                            [self.webAppToolkit.webView loadRequest:[NSURLRequest requestWithURL:[[NSURL alloc] initWithString:rule.url]]];
                        }
                        break;
                    }
                    default:
                        NSLog(@"ERROR - No rule");
                        break;
                }
                
                return YES;
            }
        }
    }
    
    return NO;
}

- (void)toast:(NSString *)message
{
    [Alert alert:@"WAT" withMessage:message];
}

@end

#import <UIKit/UIKit.h>
#import "WATRedirectRulesConfig.h"

@interface PopupViewController : UIViewController<UIWebViewDelegate> {
    UIWebView *webView;
    WATRedirectRulesConfig *rule;
}

@property (nonatomic, strong) NSURLRequest *request;
@property (nonatomic, retain) UIWebView *webView;
@property(nonatomic, retain) WATRedirectRulesConfig *rule;

@end

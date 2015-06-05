#import "PopupViewController.h"

@interface PopupViewController ()

@end

@implementation PopupViewController

@synthesize webView, rule;

#pragma mark - Init

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    CGRect wRect = [UIScreen mainScreen].bounds;
    
    webView = [[UIWebView alloc] initWithFrame:CGRectMake(0.0, 0.0, wRect.size.width, wRect.size.height)];
    webView.delegate = self;
    [self.view addSubview:webView];
    
    if (!rule.hideCloseButton) {
        UIBarButtonItem *close = [[UIBarButtonItem alloc] initWithTitle:@"Close" style:UIBarButtonItemStylePlain target:self action:@selector(closeButtonPressed)];
        [self.navigationItem setLeftBarButtonItem:close];
    }
    
    if (self.request != nil )
    {
        NSLog(@"Popup ready URL:%@", [[self.request URL] absoluteString]);
        [self openRequest:self.request];
    }
}

- (BOOL)webView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request navigationType:(UIWebViewNavigationType)navigationType {
    NSString *url = [[request URL] absoluteString];
    
    NSUInteger numberOfMatches = [rule.closeOnMatchPattern numberOfMatchesInString:url options:0 range:NSMakeRange(0, [url length])];
    if (numberOfMatches > 0)
    {
        [self dismissViewControllerAnimated:YES completion:NULL];
        return NO;
    }
    return YES;
}

#pragma mark - Interaction

- (void)closeButtonPressed
{
    NSLog(@"Close");
    [self dismissViewControllerAnimated:YES completion:NULL];
}

- (void)openRequest:(NSURLRequest *)request
{
    NSLog(@"Popup URL request: %@", [[self.request URL] absoluteString]); // request.mainDocumentURL.absoluteString
    [self.webView loadRequest:request];
}



@end

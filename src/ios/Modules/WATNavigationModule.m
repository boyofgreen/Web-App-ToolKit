#import "WATNavigationModule.h"
#import "CDVWebAppToolkit.h"

@interface WATNavigationModule ()

@property UIBarButtonItem *backButton;

@end

@implementation WATNavigationModule

@synthesize webAppToolkit;

- (id)initWithPlugin:(CDVWebAppToolkit *)_webAppToolkit {
    self = [super init];

    if (self) {
        if(_webAppToolkit != nil) {
            self.webAppToolkit = _webAppToolkit;
            
            [[NSNotificationCenter defaultCenter] addObserver:self
                                                     selector:@selector(inject:)
                                                         name:kModuleConstantsWebViewDidFinishLoad
                                                       object:nil];
        }
    }

    return self;
}

- (id)init {
    return [self initWithPlugin:nil];
}

- (void) inject:(NSNotification*)notification {
    if ([[notification name] isEqualToString:kModuleConstantsWebViewDidFinishLoad]) {
        WATNavigationConfig *navigationConfig = self.webAppToolkit.manifest.navigationConfig;
        
        if (!navigationConfig.hideOnPageBackButton) {
            if ([navigationConfig hasRules]) {
                NSString *_url = self.webAppToolkit.webView.request.URL.absoluteString;
                NSUInteger numberOfMatches = [navigationConfig.regexPattern numberOfMatchesInString:_url options:0 range:NSMakeRange(0, [_url length])];
                if (numberOfMatches > 0) {
                    [self showBackButton:NO];
                    return;
                }
            }
            
            [self showBackButton:[self.webAppToolkit.webView canGoBack]];
        }
    }
}

- (void) showBackButton:(BOOL)show {
    if (show) {
        if (!self.backButton){
            
            UIView *arrowBack  = [[UIView alloc] initWithFrame:CGRectMake(0.0, 25, 18, 25)];
            
            UIImageView* image = [[UIImageView alloc] initWithImage: [UIImage imageNamed:@"back_arrow.png"]];
            image.frame = CGRectMake(0, 0, 18, 25);
            image.image = [image.image imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate];
            
            [arrowBack addSubview:image];
            [arrowBack addGestureRecognizer:[[UITapGestureRecognizer alloc] initWithTarget:self
                                                                                    action:@selector(navigateBack)]];
            
            self.backButton = [[UIBarButtonItem alloc] initWithCustomView:arrowBack];
        }
        
        self.webAppToolkit.navItem.leftBarButtonItem = self.backButton;
    } else {
        self.webAppToolkit.navItem.leftBarButtonItem = nil;
    }
}

- (void) navigateBack {
    if ([self.webAppToolkit.webView canGoBack]) {
        [self.webAppToolkit.webView goBack];
    }
}

@end

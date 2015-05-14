#import <Cordova/CDVPlugin.h>

@interface CDVWebAppToolkit : CDVPlugin

- (void)share:(CDVInvokedUrlCommand*)command;

- (void)shareUrl:(NSString *)url withMessage:(NSString *)message withImage:(BOOL) addImage;

@end

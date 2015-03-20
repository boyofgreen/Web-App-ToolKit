#import <Cordova/CDVPlugin.h>

@interface CDVWebAppToolkit : CDVPlugin

- (void)initialize:(CDVInvokedUrlCommand*)command;

- (void)share:(CDVInvokedUrlCommand*)command;

- (void)shareUrl:(NSString *)url :(NSString *)message;

@end

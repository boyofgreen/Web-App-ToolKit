#import "Alert.h"

@implementation Alert

#pragma mark - Alerts

+ (void)alertWithError:(NSString *)message
{
    [self alert:@"Error" withMessage:message];
}

+ (void)alert:(NSString *)titleText withMessage:(NSString *)message
{
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:titleText message:message delegate:nil cancelButtonTitle:@"Ok" otherButtonTitles:nil];
    [alert show];
}

@end

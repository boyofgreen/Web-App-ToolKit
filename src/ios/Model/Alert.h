#import <Foundation/Foundation.h>

@interface Alert : NSObject

+ (void)alertWithError:(NSString *)message;
+ (void)alert:(NSString *)titleText withMessage:(NSString *)message;

@end

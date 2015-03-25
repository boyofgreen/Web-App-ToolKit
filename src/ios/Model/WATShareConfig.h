#import <Foundation/Foundation.h>

@interface WATShareConfig : NSObject
{
    BOOL enabled;
    NSString* buttonText;
    NSString* title;
    NSString* url;
    BOOL screenshot;
    NSString* message;
}

@property (nonatomic, assign, readonly) BOOL enabled;
@property (nonatomic, strong, readonly) NSString *buttonText;
@property (nonatomic, strong, readonly) NSString *title;
@property (nonatomic, strong, readonly) NSString *url;
@property (nonatomic, assign, readonly) BOOL screenshot;
@property (nonatomic, strong, readonly) NSString *message;

- (id)initFromManifest:(NSDictionary*)manifest;

#define kCurrentURL @"{currentURL}"

@end

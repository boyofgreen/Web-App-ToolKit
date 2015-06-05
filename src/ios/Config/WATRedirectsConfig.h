#import <Foundation/Foundation.h>

@interface WATRedirectsConfig : NSObject {
    BOOL enabled;
    BOOL enableCaptureWindowOpen;
    BOOL refreshOnModalClose;
    NSMutableArray *rules;
}

@property(nonatomic, assign) BOOL enabled;
@property(nonatomic, assign) BOOL enableCaptureWindowOpen;
@property(nonatomic, assign) BOOL refreshOnModalClose;
@property(nonatomic, retain) NSMutableArray *rules;

- (id)initFromManifest:(NSDictionary*) manifestData withBaseUrl:(NSString*)baseUrl;

@end

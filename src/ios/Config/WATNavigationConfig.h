#import <Foundation/Foundation.h>

@interface WATNavigationConfig : NSObject {
    NSMutableArray *hideBackButtonOnMatch;
    NSRegularExpression *regexPattern;
    BOOL hideOnPageBackButton;
    NSString *baseUrl;
}

@property(nonatomic, retain) NSMutableArray *hideBackButtonOnMatch;
@property(nonatomic, retain) NSRegularExpression *regexPattern;
@property(nonatomic, assign) BOOL hideOnPageBackButton;
@property(nonatomic, retain) NSString *baseUrl;

- (id) initFromManifest:(NSDictionary*) manifestData withBaseUrl:(NSString *)_baseUrl;
- (BOOL) hasRules;

@end

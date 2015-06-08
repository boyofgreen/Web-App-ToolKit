#import <Foundation/Foundation.h>

typedef NS_ENUM(NSInteger, RuleActionType) {
    kShowMessage=0,
    kPopout,
    kRedirect,
    kModal,
    kUnknown
};

@interface WATRedirectRulesConfig : NSObject {
    NSString *pattern;
    NSRegularExpression *regexPattern;
    NSString *action;
    NSString *message;
    NSString *url;
    RuleActionType actionType;
    BOOL hideCloseButton;
    NSString *closeOnMatch;
    NSRegularExpression *closeOnMatchPattern;
    NSString *baseUrl;
}

@property(nonatomic, retain) NSString *pattern;
@property(nonatomic, retain) NSRegularExpression *regexPattern;
@property(nonatomic, retain) NSString *action;
@property(nonatomic, retain) NSString *message;
@property(nonatomic, retain) NSString *url;
@property(nonatomic, assign) RuleActionType actionType;
@property(nonatomic, assign) BOOL hideCloseButton;
@property(nonatomic, retain) NSString *closeOnMatch;
@property(nonatomic, retain) NSRegularExpression *closeOnMatchPattern;
@property(nonatomic, retain) NSString *baseUrl;

- (id)initFromManifest:(NSDictionary*) manifestData withBaseUrl:(NSString *)_baseUrl;
- (BOOL)hasRuleMatchedURL:(NSString *)_url;

@end

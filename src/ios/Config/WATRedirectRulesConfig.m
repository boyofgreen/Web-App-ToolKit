#import "WATRedirectRulesConfig.h"

@implementation WATRedirectRulesConfig

@synthesize pattern, regexPattern, action, message, url, closeOnMatch, closeOnMatchPattern, baseUrl, actionType, hideCloseButton;

- (id)initFromManifest:(NSDictionary*) manifestData withBaseUrl:(NSString *)_baseUrl {
    self = [super init];
    
    if (self)
    {
        baseUrl = _baseUrl;
        
        if (manifestData) {
            if ([manifestData objectForKey:@"pattern"]) {
                pattern = [manifestData objectForKey:@"pattern"];
            }
            
            if ([manifestData objectForKey:@"action"]) {
                action = [manifestData objectForKey:@"action"];
            }

            if ([manifestData objectForKey:@"url"]) {
                url = [manifestData objectForKey:@"url"];
            }
            
            if ([manifestData objectForKey:@"message"]) {
                message = [manifestData objectForKey:@"message"];
            }
            
            if ([manifestData objectForKey:@"closeOnMatch"]) {
                closeOnMatch = [manifestData objectForKey:@"closeOnMatch"];
            }
            
            if ([manifestData objectForKey:@"hideCloseButton"]) {
                hideCloseButton = [[manifestData objectForKey:@"hideCloseButton"] boolValue];
            }
            
            if ([action isEqualToString:@"showMessage"]) {
                actionType = kShowMessage;
            } else if ([action isEqualToString:@"popout"]) {
                actionType = kPopout;
            } else if ([action isEqualToString:@"redirect"]) {
                actionType = kRedirect;
            } else if ([action isEqualToString:@"modal"]) {
                actionType = kModal;
            } else if ([action isEqualToString:@"unknown"]) {
                actionType = kUnknown;
            }
            
            regexPattern = [self processPatternForRegex:pattern excludeLineStart:YES excludeLineEnd:YES];
            
            if (closeOnMatch != nil && ![closeOnMatch isEqualToString:@""]) {
                closeOnMatchPattern = [self processPatternForRegex:closeOnMatch excludeLineStart:YES excludeLineEnd:YES];
            }
        }
    }
    
    return self;
}

- (id)init
{
    return [self initFromManifest:nil withBaseUrl:nil];
}

- (NSRegularExpression*)processPatternForRegex:(NSString *)_pattern excludeLineStart:(BOOL)isExcludeLineStart excludeLineEnd:(BOOL)isExcludeLineEnd
{
    NSError *error = NULL;
    NSString *homeURL = [WATRedirectRulesConfig trimTrailingSlash:baseUrl];
    
    // String replacement
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"\\{baseURL\\}?" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
    _pattern = [regex stringByReplacingMatchesInString:_pattern options:0 range:NSMakeRange(0, [_pattern length]) withTemplate:homeURL];
    
    // Character escapes
    regex = [NSRegularExpression regularExpressionWithPattern:@"([.?*+^$#\\[\\]\\\\(){}|-])" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
    _pattern = [regex stringByReplacingMatchesInString:_pattern options:0 range:NSMakeRange(0, [_pattern length]) withTemplate:@"\\\\$1"];
    
    regex = [NSRegularExpression regularExpressionWithPattern:@"\\?" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
    _pattern = [regex stringByReplacingMatchesInString:_pattern options:0 range:NSMakeRange(0, [_pattern length]) withTemplate:@".?"];
    
    regex = [NSRegularExpression regularExpressionWithPattern:@"\\*" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
    _pattern = [regex stringByReplacingMatchesInString:_pattern options:0 range:NSMakeRange(0, [_pattern length]) withTemplate:@".*?"];
    
    if (!isExcludeLineStart)
    {
        _pattern = [NSString stringWithFormat:@"^%@",_pattern];
    }
    if (!isExcludeLineEnd)
    {
        _pattern = [NSString stringWithFormat:@"%@$",_pattern];
    }
    
    return [NSRegularExpression regularExpressionWithPattern:_pattern options:NSRegularExpressionCaseInsensitive error:&error];
}

- (BOOL)hasRuleMatchedURL:(NSString *)_url
{
    BOOL isMatch = NO;
    if (regexPattern != nil && [_url length] > 0)
    {
        NSUInteger numberOfMatches = [regexPattern numberOfMatchesInString:_url options:0 range:NSMakeRange(0, [_url length])];
        if (numberOfMatches > 0)
        {
            isMatch = YES;
        }
    }
    return isMatch;
}

+ (NSString *)trimTrailingSlash:(NSString *)url
{
    if ( [[url substringFromIndex:[url length]-1] isEqualToString:@"/"] )
    {
        return [url substringToIndex:[url length]-1];
    }
    else
    {
        return url;
    }
}

+ (NSString *)escapeBackslashes:(NSString *)regexString
{
    NSError *error = NULL;
    NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"\\\\" options:NSRegularExpressionCaseInsensitive | NSRegularExpressionDotMatchesLineSeparators | NSRegularExpressionAnchorsMatchLines | NSRegularExpressionAllowCommentsAndWhitespace error:&error];
    if (error == NULL)
    {
        return [regex stringByReplacingMatchesInString:regexString options:0 range:NSMakeRange(0, [regexString length]) withTemplate:@"\\\\"];
    }
    else
    {
        return regexString;
    }
}

@end

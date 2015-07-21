#import "WATNavigationConfig.h"

@implementation WATNavigationConfig

@synthesize hideBackButtonOnMatch, regexPattern, baseUrl, hideOnPageBackButton;

- (id)initFromManifest:(NSDictionary*) manifestData withBaseUrl:(NSString *)_baseUrl {
    self = [super init];
    
    if (self)
    {
        baseUrl = _baseUrl;
        
        if (manifestData) {
            if ([manifestData objectForKey:@"hideBackButtonOnMatch"]) {
                NSDictionary *rulesDict = [manifestData objectForKey:@"hideBackButtonOnMatch"];
                hideBackButtonOnMatch = [[NSMutableArray alloc] initWithCapacity:rulesDict.count];
                
                NSEnumerator *en = [rulesDict objectEnumerator];
                id object;
                while ((object = [en nextObject])) {
                    NSString *r = (NSString*)object;
                    
                    [hideBackButtonOnMatch addObject:r];
                }
            }
            
            if ([manifestData objectForKey:@"hideOnPageBackButton"]) {
                hideOnPageBackButton = [[manifestData objectForKey:@"hideOnPageBackButton"] boolValue];
            }
            
            regexPattern = [self processPatternForRegex];
        }
    }
    
    return self;
}

- (id)init
{
    return [self initFromManifest:nil withBaseUrl:nil];
}

- (NSRegularExpression*)processPatternForRegex {
    NSError *error = NULL;
    NSString *homeURL = baseUrl;
    NSString *pattern = @"";
    
    for (int i=0; i<hideBackButtonOnMatch.count; i++) {
        NSString *rule = [hideBackButtonOnMatch objectAtIndex:i];
        
        // String replacement
        NSRegularExpression *regex = [NSRegularExpression regularExpressionWithPattern:@"\\{baseURL\\}?" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
        rule = [regex stringByReplacingMatchesInString:rule options:0 range:NSMakeRange(0, [rule length]) withTemplate:homeURL];
        
        // Character escapes
        regex = [NSRegularExpression regularExpressionWithPattern:@"([.?*+^$#\\[\\]\\\\(){}|-])" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
        rule = [regex stringByReplacingMatchesInString:rule options:0 range:NSMakeRange(0, [rule length]) withTemplate:@"\\\\$1"];
        
        regex = [NSRegularExpression regularExpressionWithPattern:@"\\?" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
        rule = [regex stringByReplacingMatchesInString:rule options:0 range:NSMakeRange(0, [rule length]) withTemplate:@".?"];
        
        regex = [NSRegularExpression regularExpressionWithPattern:@"\\*" options:NSRegularExpressionCaseInsensitive|NSRegularExpressionAnchorsMatchLines error:&error];
        rule = [regex stringByReplacingMatchesInString:rule options:0 range:NSMakeRange(0, [rule length]) withTemplate:@".*?"];
        
        if (i > 0) {
            pattern = [NSString stringWithFormat:@"%@%@", pattern, [NSString stringWithFormat:@"|(%@)", rule]];
        } else {
            pattern = [NSString stringWithFormat:@"(%@)", rule];
        }
    }
    
    return [NSRegularExpression regularExpressionWithPattern:pattern options:NSRegularExpressionCaseInsensitive error:&error];
}

- (BOOL) hasRules {
    return hideBackButtonOnMatch != nil && hideBackButtonOnMatch.count > 0;
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

#import "WATInjectionModule.h"
#import "CDVWebAppToolkit.h"

@implementation WATInjectionModule

@synthesize webAppToolkit;

- (id)initWithPlugin:(CDVWebAppToolkit *)_webAppToolkit {
    self = [super init];

    if (self) {
        if(_webAppToolkit != nil) {
            self.webAppToolkit = _webAppToolkit;
            
            [[NSNotificationCenter defaultCenter] addObserver:self
                                                     selector:@selector(inject:)
                                                         name:kModuleConstantsWebViewDidFinishLoad
                                                       object:nil];
        }
    }

    return self;
}

- (id)init {
    return [self initWithPlugin:nil];
}

- (void) inject:(NSNotification*)notification {
    if ([[notification name] isEqualToString:kModuleConstantsWebViewDidFinishLoad]) {
        if (self.webAppToolkit.manifest != nil) {
            if (self.webAppToolkit.manifest.scriptInjection.enabled) {
                [self injectJavascript];
            }
            
            if (self.webAppToolkit.manifest.styleInjection.enabled) {
                [self injectStylesheet];
            }
        }
    }
}

- (NSString *) getScriptFromInlineStyle:(NSString *)styles {
    return [NSString stringWithFormat: @"javascript:( function() { var parent = document.getElementsByTagName('head').item(0);var style = document.createElement('style');style.type = 'text/css';style.appendChild(document.createTextNode('%@'));parent.appendChild(style)})();",styles];
}

- (NSString *) getContentFromStyleFile:(NSString *)fileName toolkit:(CDVWebAppToolkit*) webAppToolkit{

    NSString *path = self.webAppToolkit.manifest.styleInjection.filePath;
    NSString *partialPath = [NSString stringWithFormat: @"%@%@", path, fileName];
    NSString *fullPath = [self.webAppToolkit.commandDelegate pathForResource:partialPath];

    NSString* content = [NSString stringWithContentsOfFile:fullPath
                                                  encoding:NSUTF8StringEncoding
                                                     error:NULL];


    content = [content stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]];

    return [NSString stringWithFormat: @"javascript:( function() { var p = document.getElementsByTagName('head').item(0);var s = document.createElement('style');s.type = 'text/css';s.appendChild(document.createTextNode('%@'));p.appendChild(s)})();",content];
}


- (NSString *) getContentFromCustomScriptFile:(NSString *)fileName toolkit:(CDVWebAppToolkit*) webAppToolkit {
    NSString *path = self.webAppToolkit.manifest.scriptInjection.filePath;
    NSString *partialPath = [NSString stringWithFormat: @"%@%@", path, fileName];

    NSString *fullPath = [self.webAppToolkit.commandDelegate pathForResource:partialPath];

    NSString* content = [NSString stringWithContentsOfFile:fullPath
                                                  encoding:NSUTF8StringEncoding
                                                     error:NULL];

    content = [content stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]];
    return [NSString stringWithFormat: @"%@",content];
}

- (void)injectJavascript {
    NSString *inlineScript = self.webAppToolkit.manifest.scriptInjection.customString;
    if (inlineScript != nil) {
        [webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:inlineScript waitUntilDone:NO];
    }


    NSArray *files = self.webAppToolkit.manifest.scriptInjection.scriptFiles;
    NSString *scripts;
    for (NSString *value in files) {
        scripts = [NSString stringWithFormat:@"%@ %@", (scripts!=nil?scripts:@""), [self getContentFromCustomScriptFile:value toolkit:webAppToolkit]];
    }

    if (scripts != nil) {
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:scripts waitUntilDone:NO];
    }
}

- (void)injectStylesheet {
    NSString *inlineStyle = self.webAppToolkit.manifest.styleInjection.customString;
    if (inlineStyle != nil) {
        NSString *inlineScript = [self getScriptFromInlineStyle:inlineStyle];
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:inlineScript waitUntilDone:NO];
    }

    NSArray *files = self.webAppToolkit.manifest.styleInjection.styleFiles;
    NSString *scripts;
    for (NSString *value in files) {
        scripts = [NSString stringWithFormat:@"%@ %@", (scripts!=nil?scripts:@""), [self getContentFromStyleFile:value toolkit:webAppToolkit]];
    }

    if (scripts != nil) {
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:scripts waitUntilDone:NO];
    }
}

@end

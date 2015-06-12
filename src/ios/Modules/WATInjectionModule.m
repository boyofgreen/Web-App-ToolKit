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

- (NSString *) getContentFromFile:(NSString *)filePath {
    NSBundle* mainBundle = [NSBundle mainBundle];
    NSMutableArray* directoryParts = [NSMutableArray arrayWithArray:[filePath componentsSeparatedByString:@"/"]];
    NSString* filename = [directoryParts lastObject];
    
    [directoryParts removeLastObject];
    
    NSString* directoryPartsJoined = [directoryParts componentsJoinedByString:@"/"];
    NSString *fullPath = [mainBundle pathForResource:filename ofType:@"" inDirectory:directoryPartsJoined];
    NSString* content = [NSString stringWithContentsOfFile:fullPath
                                                  encoding:NSUTF8StringEncoding
                                                     error:nil];

    if (content != nil) {
        NSCharacterSet *dontWantChar = [NSCharacterSet newlineCharacterSet];
        content = [[content componentsSeparatedByCharactersInSet:dontWantChar] componentsJoinedByString:@""];
    } else {
        content = @"";
    }
    
    return content;
}

- (void)injectJavascript {
    WATScriptInjection *scriptInjection = self.webAppToolkit.manifest.scriptInjection;
    if (scriptInjection.customString != nil) {
        [webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:scriptInjection.customString waitUntilDone:NO];
    }

    NSArray *files = scriptInjection.scriptFiles;
    NSString *scripts;
    for (NSString *value in files) {
        scripts = [NSString stringWithFormat:@"%@%@", (scripts!=nil?scripts:@""), [self getContentFromFile:value]];
    }

    if (scripts != nil && [scripts length] != 0) {
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:scripts waitUntilDone:NO];
    }
}

- (void)injectStylesheet {
    WATStyleInjection *styleInjection = self.webAppToolkit.manifest.styleInjection;
    if (styleInjection.customString != nil) {
        NSString *inlineScript = [self getScriptFromInlineStyle:styleInjection.customString];
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:inlineScript waitUntilDone:NO];
    }
    
    if (styleInjection.styleFile != nil && [styleInjection.styleFile length] != 0) {
        NSString *styles = [self getContentFromFile:styleInjection.styleFile];
        if (styles != nil && [styles length] != 0) {
            NSString *inlineScript = [self getScriptFromInlineStyle:styles];
            [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:inlineScript waitUntilDone:NO];
        }
    }
    
    NSString *elementsToHide;
    if (styleInjection.hiddenElements != nil && styleInjection.hiddenElements.count > 0) {
        if (styleInjection.hiddenElements.count == 1) {
            elementsToHide = [styleInjection.hiddenElements objectAtIndex:0];
        } else {
            for (NSString *el in styleInjection.hiddenElements) {
                if (elementsToHide == nil) {
                    elementsToHide = [NSString stringWithFormat:@"%@", el];
                } else {
                    elementsToHide = [NSString stringWithFormat:@"%@,%@", elementsToHide, el];
                }
            }
        }
        elementsToHide = [NSString stringWithFormat:@"%@ {display:none !important;}", elementsToHide];
        
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:[self getScriptFromInlineStyle:elementsToHide] waitUntilDone:NO];
    }
}

@end

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


    NSCharacterSet *dontWantChar = [NSCharacterSet newlineCharacterSet];
    content = [[content componentsSeparatedByCharactersInSet:dontWantChar] componentsJoinedByString:@""];
    
    return content;
}


- (NSString *) getContentFromCustomScriptFile:(NSString *)fileName toolkit:(CDVWebAppToolkit*) webAppToolkit {
    NSString *path = self.webAppToolkit.manifest.scriptInjection.filePath;
    NSString *partialPath = [NSString stringWithFormat: @"%@%@", path, fileName];

    NSString *fullPath = [self.webAppToolkit.commandDelegate pathForResource:partialPath];

    NSString* content = [NSString stringWithContentsOfFile:fullPath
                                                  encoding:NSUTF8StringEncoding
                                                     error:NULL];

    NSCharacterSet *dontWantChar = [NSCharacterSet newlineCharacterSet];
    content = [[content componentsSeparatedByCharactersInSet:dontWantChar] componentsJoinedByString:@""];
    
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
        scripts = [NSString stringWithFormat:@"%@%@", (scripts!=nil?scripts:@""), [self getContentFromCustomScriptFile:value toolkit:webAppToolkit]];
    }

    if (scripts != nil) {
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:scripts waitUntilDone:NO];
    }
}

- (void)injectStylesheet {
    WATStyleInjection *styleInjection = self.webAppToolkit.manifest.styleInjection;
    if (styleInjection.customString != nil) {
        NSString *inlineScript = [self getScriptFromInlineStyle:styleInjection.customString];
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:inlineScript waitUntilDone:NO];
    }

    NSArray *files = self.webAppToolkit.manifest.styleInjection.styleFiles;
    NSString *styles;
    for (NSString *value in files) {
        styles = [NSString stringWithFormat:@"%@%@", (styles!=nil?styles:@""), [self getContentFromStyleFile:value toolkit:webAppToolkit]];
    }

    if (styles != nil) {
        NSString *inlineScript = [self getScriptFromInlineStyle:styles];
        [self.webAppToolkit.webView performSelectorOnMainThread:@selector(stringByEvaluatingJavaScriptFromString:) withObject:inlineScript waitUntilDone:NO];
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

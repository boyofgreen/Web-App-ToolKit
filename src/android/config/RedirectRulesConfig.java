package com.manifoldjs.webapptoolkit.config;

import java.util.regex.Pattern;

import org.json.JSONObject;

public class RedirectRulesConfig {

  private String pattern;
  private Pattern regexPattern;
  
  private String action;
  private String message;
  private String url;
  private RuleActionType actionType;
  private boolean hideCloseButton;
  private String closeOnMatch;
  private Pattern closeOnMatchPattern;
  private String baseUrl;
  
  public enum RuleActionType {
      showMessage,
      popout,
      redirect,
      modal,
      unknown
  }
  
  public RedirectRulesConfig() {
  }
	
  public RedirectRulesConfig(JSONObject manifestObject, String baseUrl) {
  	this.baseUrl = baseUrl;
  	
  	this.pattern = manifestObject.optString("pattern", null);
  	this.action = manifestObject.optString("action", null);
  	this.url = manifestObject.optString("url", null);
  	this.message = manifestObject.optString("message", null);
  	this.hideCloseButton = manifestObject.optBoolean("hideCloseButton", false);
  	this.closeOnMatch = manifestObject.optString("closeOnMatch", null);
  	
    if (action.equals("showMessage")) {
    	actionType = RuleActionType.showMessage;
    } else if (action.equals("popout")) {
    	actionType = RuleActionType.popout;
    } else if (action.equals("redirect")) {
    	actionType = RuleActionType.redirect;
    } else if (action.equals("modal")) {
    	actionType = RuleActionType.modal;
    } else {
      actionType = RuleActionType.unknown;
    }

    //Build Regex Pattern for URL
    regexPattern = processPatternForRegex(pattern, true, true);
    
    //Build Regex Pattern for match on close
    if (closeOnMatch != null && 
    		!closeOnMatch.isEmpty()) {
        closeOnMatchPattern = processPatternForRegex(closeOnMatch, true, true);
    }
  }
  
  private Pattern processPatternForRegex(String pattern, boolean excludeLineStart, boolean excludeLineEnd) {
    String regexBody = pattern;
    regexBody = regexBody.replaceAll("\\{baseURL\\}", this.baseUrl);
    regexBody = regexBody.replaceAll("([.?*+^$\\[\\]\\\\(){}|-])", "\\\\$1");
    regexBody = regexBody.replace("\\?", ".?");
    regexBody = regexBody.replace("\\*", ".*?");
    if (!excludeLineStart) {
        regexBody = "^" + regexBody;
    }
    if (!excludeLineEnd) {
        regexBody += "$";
    }
    return Pattern.compile(regexBody);
	}

	public String getPattern() {
  	return pattern;
  }

	public String getAction() {
  	return action;
  }

	public String getMessage() {
  	return message;
  }

	public String getUrl() {
  	return url;
  }

	public boolean isHideCloseButton() {
  	return hideCloseButton;
  }

	public String getCloseOnMatch() {
  	return closeOnMatch;
  }
	
	public RuleActionType getActionType() {
  	return actionType;
  }

	public Pattern getRegexPattern() {
  	return regexPattern;
  }

	public Pattern getCloseOnMatchPattern() {
  	return closeOnMatchPattern;
  }
  
}

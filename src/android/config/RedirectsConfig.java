package com.manifoldjs.webapptoolkit.config;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import com.manifoldjs.webapptoolkit.model.Manifest;

public class RedirectsConfig {

	private boolean enabled;
	private boolean enableCaptureWindowOpen;
	private boolean refreshOnModalClose;
	private List<RedirectRulesConfig> rules;

	public RedirectsConfig() {
	}

	public RedirectsConfig(JSONObject manifestObject, Manifest manifest) {
		if (manifestObject != null) {
			this.enabled = manifestObject.optBoolean("enabled", false);
			this.enableCaptureWindowOpen = manifestObject.optBoolean("enableCaptureWindowOpen", false);
			this.refreshOnModalClose = manifestObject.optBoolean("refreshOnModalClose", false);

			this.rules = new ArrayList<RedirectRulesConfig>();
			JSONArray jsonRules = manifestObject.optJSONArray("rules");
			if (jsonRules != null) {
				for (int i = 0; i < jsonRules.length(); i++) {
					RedirectRulesConfig rule = new RedirectRulesConfig(jsonRules.optJSONObject(i), manifest.getStartUrl());
					this.rules.add(rule);
				}
			}
		}
	}

	public boolean isEnabled() {
	return enabled;
	}

	public boolean isEnableCaptureWindowOpen() {
	return enableCaptureWindowOpen;
	}

	public boolean isRefreshOnModalClose() {
	return refreshOnModalClose;
	}

	public List<RedirectRulesConfig> getRules() {
	return rules;
	}

	public boolean hasRules() {
	  return rules.size() > 0;
	}

}

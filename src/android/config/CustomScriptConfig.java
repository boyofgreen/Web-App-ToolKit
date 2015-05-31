package com.microsoft.webapptoolkit.config;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import android.util.Log;

  public class CustomScriptConfig {
  private List<String> scriptFiles = new ArrayList<String>();
  private String customString = null;
  private boolean enabled = false;

  public CustomScriptConfig() {
  }

  public CustomScriptConfig(JSONObject manifestObject) {
    if (manifestObject != null) {
      if (manifestObject.has("scriptFiles")) {
        JSONArray files = manifestObject.optJSONArray("scriptFiles");

        if (files != null && files.length() > 0) {
          enabled = true;

          for (int i = 0; i < files.length(); i++) {
            this.scriptFiles.add(files.optString(i));
          }
        }
      }

      if (manifestObject.has("customJSString")) {
        enabled = true;
        this.customString = manifestObject.optString("customJSString");
      }
    }
  }

  public List<String> getScriptFiles() {
    return this.scriptFiles;
  }

  public String getCustomString() {
    return this.customString;
  }

  public boolean isEnabled() {
    return this.enabled;
  }
}

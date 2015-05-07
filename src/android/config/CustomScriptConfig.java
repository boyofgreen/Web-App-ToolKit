package com.microsoft.webapptoolkit.config;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import android.util.Log;

public class CustomScriptConfig {

  // This should be the default path for all the "external" files required
  // by the user.
  // TODO: As an additional feature we could allow set a custom
  // preferences tag into
  // the config.xml file to the user and check if this preference exists.
  private List<String> scriptFiles = new ArrayList<String>();
  private String customString = null;
  private boolean enabled = false;

  public static final String WTAG = "WTAG: ";

  private static String DefaultFilePath = "www/js/";

  private String filePath = CustomScriptConfig.DefaultFilePath;

  public CustomScriptConfig() {
  }

  public CustomScriptConfig(JSONObject manifestObject) {
    if (manifestObject != null) {
      if (manifestObject.has("scriptFiles")) {
        JSONArray files = manifestObject.optJSONArray("scriptFiles");

        if (files != null && files.length() > 0) {
          enabled = true;

          for (int i = 0; i < files.length(); i++) {
            this.scriptFiles.add(this.filePath + files.optString(i));
          }
        }
      }

      if (manifestObject.has("customJSString")) {
        enabled = true;
        this.customString = manifestObject.optString("customJSString");
      }
    }
  }

  public String getFilePath() {
     return this.filePath;
  }

  public void setCustomFilePath(String newFilePath) {
    if (validateFilePath(newFilePath)) {
      this.filePath = newFilePath;
    } else {
      this.filePath = CustomScriptConfig.DefaultFilePath;
      Log.w(CustomScriptConfig.WTAG,
               "An invalid or null path received for the custom script files. The default location will be used (/assets/www/js/).");
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

  private static boolean validateFilePath(String path) {
    if (path == null || path.equals("")
    || !path.matches("\\A(?:[0-9a-zA-Z\\_\\-]+\\/)+\\z")) {
      return false;
    }
    return true;
  }
}

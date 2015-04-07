package com.microsoft.webapptoolkit.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
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

  private static String filePath = "www/files/";

  public static String getFilePath() {
    return CustomScriptConfig.filePath;
  }

  public static void setCustomFilePath(String newFilePath) {
    if (newFilePath != null) {
      CustomScriptConfig.filePath = newFilePath;
    } else {
      Log.w(CustomScriptConfig.WTAG,
        "An invalid or null PathFile received. You can put your files into the default path (/assets/www/files/) .");
    }
  }

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

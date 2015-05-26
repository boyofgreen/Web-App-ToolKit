package com.microsoft.webapptoolkit.config;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONObject;

import android.util.Log;

public class StylesConfig {
  private List<String> styleFiles = new ArrayList<String>();
  private List<String> hiddenElements = new ArrayList<String>();
  private String customString = "";
  private boolean enabled = false;

  public static final String WTAG = "WTAG: ";

  private static String DefaultFilePath = "www/css/";

  private String filePath = StylesConfig.DefaultFilePath;

  public StylesConfig() {
  }

  public StylesConfig(JSONObject manifestObject) {
    if (manifestObject != null) {
      if (manifestObject.has("customCssFiles")) {
        JSONArray files = manifestObject.optJSONArray("customCssFiles");

        if (files != null && files.length() > 0) {
          this.enabled = true;

          for (int i = 0; i < files.length(); i++) {
            this.styleFiles.add(this.filePath + files.optString(i));
          }
        }
      }

      if (manifestObject.has("hiddenElements")) {
        JSONArray hiddenElements = manifestObject.optJSONArray("hiddenElements");

        if (hiddenElements != null && hiddenElements.length() > 0) {
          this.enabled = true;

          for (int i = 0; i < hiddenElements.length(); i++) {
            this.hiddenElements.add(hiddenElements.optString(i));
          }
        }
      }

      if (manifestObject.has("customCssString")) {
        this.enabled = true;
        this.customString = manifestObject.optString("customCssString");
      }
    }
  }

  public List<String> getCssFiles() {
    return this.styleFiles;
  }

  public String getCustomString() {
    return this.customString;
  }

  public String getInlineStyles() {
    StringBuilder builder = new StringBuilder();
    if (this.hiddenElements.size() > 0){
      for (String hiddenElement: this.hiddenElements){
        builder.append(hiddenElement);
        builder.append(",");
      }
      builder.deleteCharAt(builder.length() - 1);

      builder.append("{display:none !important;}");
    }

    builder.append(this.customString);
    return builder.toString();
  }

  public boolean isEnabled() {
    return this.enabled;
  }
}

package com.microsoft.webapptoolkit.model;

import org.json.JSONObject;

public class ShareConfig
{
  public static final String CURRENT_URL = "{currentURL}";

  private boolean enabled = false;
  private String buttonText = "Share";
  private String title = null;
  private String url = ShareConfig.CURRENT_URL;
  private boolean screenshot = false;
  private String message = null;

  public ShareConfig() {
  }

  public ShareConfig(JSONObject manifestObject) {
    if (manifestObject != null) {
      this.enabled = true;

      if (manifestObject.has("enabled")) {
        this.enabled = manifestObject.optBoolean("enabled");
      }

      if (manifestObject.has("buttonText")) {
        this.buttonText = manifestObject.optString("buttonText");
      }

      if (manifestObject.has("title")) {
        this.title = manifestObject.optString("title");
      }

      if (manifestObject.has("url")) {
        this.url = manifestObject.optString("url");
      }

      if (manifestObject.has("screenshot")) {
        this.screenshot = manifestObject.optBoolean("screenshot");
      }

      if (manifestObject.has("message")) {
        this.message = manifestObject.optString("message");
      }
    }
  }

  public boolean isEnabled() {
    return this.enabled;
  }

  public String getButtonText() {
    return this.buttonText;
  }

  public String getTitle() {
    return this.title;
  }

  public String getUrl() {
    return this.url;
  }

  public boolean addScreenshot() {
    return this.screenshot;
  }

  public String getMessage() {
    return this.message;
  }
}

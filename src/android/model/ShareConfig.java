package com.microsoft.webapptoolkit.model;

import org.json.JSONException;
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

      try {
        if (manifestObject.has("buttonText")) {
          this.buttonText = manifestObject.getString("buttonText");
        }

        if (manifestObject.has("title")) {
          this.title = manifestObject.getString("title");
        }

        if (manifestObject.has("url")) {
          this.url = manifestObject.getString("url");
        }

        if (manifestObject.has("screenshot")) {
          this.screenshot = manifestObject.getBoolean("screenshot");
        }

        if (manifestObject.has("message")) {
          this.message = manifestObject.getString("message");
        }
      } catch (JSONException e) {
        e.printStackTrace();
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

  public boolean isScreenshot() {
    return this.screenshot;
  }

  public String getMessage() {
    return this.message;
  }
}

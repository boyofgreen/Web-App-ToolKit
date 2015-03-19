package com.microsoft.webapptoolkit.model;

import org.json.JSONException;
import org.json.JSONObject;

public class Manifest
{
  private String startUrl;
  private ShareConfig share;

  public Manifest() {
    this.share = new ShareConfig();
  }

  public Manifest(JSONObject manifestObject) {
    if (manifestObject != null) {
      try {
        if (manifestObject.has("start_url")) {
          this.startUrl = manifestObject.getString("start_url");
        }

        if (manifestObject.has("wat_share")) {
          this.share = new ShareConfig(manifestObject.getJSONObject("wat_share"));
        } else {
          this.share = new ShareConfig();
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  public String getStartUrl() {
    return this.startUrl;
  }

  public ShareConfig getShare() {
    return this.share;
  }
}

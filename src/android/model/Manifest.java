package com.microsoft.webapptoolkit.model;

import org.json.JSONException;
import org.json.JSONObject;

public class Manifest
{
  private String startUrl;
  private ManifestShare share;

  public Manifest() {
    this.share = new ManifestShare();
  }

  public Manifest(JSONObject manifestObject) {
    if (manifestObject != null) {
      try {
        if (manifestObject.has("start_url")) {
          this.startUrl = manifestObject.getString("start_url");
        }

        if (manifestObject.has("wat_share")) {
          this.share = new ManifestShare(manifestObject.getJSONObject("wat_share"));
        } else {
          this.share = new ManifestShare();
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  public String getStartUrl() {
    return this.startUrl;
  }

  public ManifestShare getShare() {
    return this.share;
  }
}

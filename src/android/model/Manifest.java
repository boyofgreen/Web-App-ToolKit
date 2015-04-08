package com.microsoft.webapptoolkit.model;

import org.json.JSONException;
import org.json.JSONObject;

public class Manifest {
  private String startUrl;
  private String name;
  private ShareConfig share;
  private CustomScriptConfig customScript;
  private StylesConfig styles;
  private NavBarConfig navBar;
  private AppBarConfig appBar;

  public Manifest() {
    this.share = new ShareConfig();
    this.customScript = new CustomScriptConfig();
    this.styles = new StylesConfig();
    this.navBar = new NavBarConfig();
    this.appBar = new AppBarConfig();
  }

  public Manifest(JSONObject manifestObject) {
    if (manifestObject != null) {
      if (manifestObject.has("start_url")) {
        this.startUrl = manifestObject.optString("start_url");
      }

      if (manifestObject.has("name")) {
        this.name = manifestObject.optString("name");
      }

      if (manifestObject.has("wat_share")) {
        this.share = new ShareConfig(manifestObject.optJSONObject("wat_share"));
      } else {
        this.share = new ShareConfig();
      }

      if (manifestObject.has("wat_customScript")){
        this.customScript = new CustomScriptConfig(manifestObject.optJSONObject("wat_customScript"));
      }else{
        this.customScript = new CustomScriptConfig();
      }

      if (manifestObject.has("wat_styles")){
        this.styles = new StylesConfig(manifestObject.optJSONObject("wat_styles"));
      }else{
        this.styles = new StylesConfig();
      }

      if (manifestObject.has("wat_navBar")) {
        this.navBar = new NavBarConfig(manifestObject.optJSONObject("wat_navBar"));
      } else {
        this.navBar = new NavBarConfig();
      }

      if (manifestObject.has("wat_appBar")) {
        this.appBar = new AppBarConfig(manifestObject.optJSONObject("wat_appBar"));
      } else {
        this.appBar = new AppBarConfig();
      }
    }
  }

  public String getStartUrl() {
    return this.startUrl;
  }

  public String getName() {
    return this.name;
  }

  public ShareConfig getShare() {
    return this.share;
  }

  public CustomScriptConfig getCustomScript() {
    return this.customScript;
  }

  public StylesConfig getStyles() {
    return this.styles;
  }

  public NavBarConfig getNavBar() {
    return this.navBar;
  }

  public AppBarConfig getAppBar() {
    return this.appBar;
  }
}

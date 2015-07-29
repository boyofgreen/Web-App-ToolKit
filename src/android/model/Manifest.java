package com.manifoldjs.webapptoolkit.model;

import org.json.JSONObject;

import com.manifoldjs.webapptoolkit.config.CustomScriptConfig;
import com.manifoldjs.webapptoolkit.config.RedirectsConfig;
import com.manifoldjs.webapptoolkit.config.StylesConfig;

public class Manifest {

  private String startUrl;
  private String name;
  private String shortName;
  private CustomScriptConfig customScript;
  private StylesConfig styles;
  private RedirectsConfig redirects;

  public Manifest() {
    this.customScript = new CustomScriptConfig();
    this.styles = new StylesConfig();
    this.redirects = new RedirectsConfig();
  }

  public Manifest(JSONObject manifestObject) {
    if (manifestObject != null) {
      if (manifestObject.has("start_url")) {
        this.startUrl = manifestObject.optString("start_url");
      }

      if (manifestObject.has("name")) {
        this.name = manifestObject.optString("name");
      }

      if (manifestObject.has("short_name")) {
        this.shortName = manifestObject.optString("short_name");
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

      if (manifestObject.has("wat_redirects")) {
		this.redirects = new RedirectsConfig(
		manifestObject.optJSONObject("wat_redirects"), this);
      } else {
		this.redirects = new RedirectsConfig();
      }
    }
  }

  public String getStartUrl() {
    return this.startUrl;
  }

  public String getName() {
    return this.name;
  }

  public String getShortName() {
    return this.shortName;
  }

  public CustomScriptConfig getCustomScript() {
    return this.customScript;
  }

  public StylesConfig getStyles() {
    return this.styles;
  }

  public RedirectsConfig getRedirectsConfig() {
		return this.redirects;
	}
}

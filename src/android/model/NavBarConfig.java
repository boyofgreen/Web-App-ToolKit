package com.microsoft.webapptoolkit.model;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

public class NavBarConfig {
  private boolean enabled = false;
  private List<MenuItem> menuItems = new ArrayList<MenuItem>();

  public NavBarConfig() {
  }

  public NavBarConfig(JSONObject manifestObject) {
    if (manifestObject != null) {
      this.enabled = true;

      if (manifestObject.has("enabled")) {
        this.enabled = manifestObject.optBoolean("enabled");
      }

      if (manifestObject.has("buttons")) {
        JSONArray arguments = manifestObject.optJSONArray("buttons");
        if (arguments != null) {
          for (int i = 0; i < arguments.length(); i++) {
            final JSONObject arg = arguments.optJSONObject(i);

            if (arg != null && !arg.optString("label").equals("")) {
              MenuItem menuItem = new MenuItem();

              menuItem.setLabel(arg.optString("label"));
              menuItem.setIcon(arg.optString("icon"));
              menuItem.setAction(arg.optString("action"));

              menuItems.add(menuItem);
            }
          }
        }
      }
    }
  }

  public List<MenuItem> getMenuItems() {
    return menuItems;
  }

  public boolean isEnabled() {
    return this.enabled;
  }
}

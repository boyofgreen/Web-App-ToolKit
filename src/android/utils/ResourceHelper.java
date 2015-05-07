package com.microsoft.webapptoolkit.utils;

import android.app.Activity;

public class ResourceHelper {
  public static int getAndroidResource(Activity activity, String res) {
    return ResourceHelper.getResourceId(activity, res, "drawable", "android");
  }

  public static int getDrawableResource(Activity activity, String imgName) {
    return ResourceHelper.getResourceId(activity, imgName, "drawable", activity.getPackageName());
  }

  public static int getResourceIconId(Activity activity, String iconName) {
    int resId = ResourceHelper.getDrawableResource(activity, "ic_action_" + iconName) | ResourceHelper.getDrawableResource(activity, iconName);

    // Fallback to Android resources
    if (resId <= 0) {
      resId = ResourceHelper.getAndroidResource(activity, iconName);
    }

    return resId;
  }

  public static int getResourceId(Activity activity, String variableName, String resourceName, String pPackageName) {
    try {
      return activity.getResources().getIdentifier(variableName, resourceName, pPackageName);
    } catch (Exception e) {
      e.printStackTrace();
      return -1;
    }
  }
}

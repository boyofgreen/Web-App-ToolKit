package com.microsoft.webapptoolkit;

import android.content.Intent;
import android.os.Build;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.widget.ShareActionProvider;

import com.microsoft.webapptoolkit.model.Manifest;
import com.microsoft.webapptoolkit.model.ShareConfig;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
* This class ...
*/
public class WebAppToolkit extends CordovaPlugin {

  private CordovaActivity activity;

  private ShareActionProvider mShareActionProvider;
  private int mShareItemId = 99;
  private Manifest manifest;

  @Override
  public void pluginInitialize() {
    this.activity = (CordovaActivity)this.cordova.getActivity();

    Window window = this.activity.getWindow();
    if(!window.hasFeature(Window.FEATURE_ACTION_BAR))
    {
      Log.e("WAT-Initialization","ActionBar feature not available, Window.FEATURE_ACTION_BAR must be enabled!. Try changing the theme.");
    }
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if (action.equals("share")) {
      if (args.length() > 0) {
        doShare(args.getString(0));
      } else {
        doShare();
      }
    } else if (action.equals("initialize")) {
      this.activity.invalidateOptionsMenu();
    } else {
      return false;
    }

    return true;
  }

  @Override
  public Object onMessage(String id, Object data) {
    if (id.equals("onCreateOptionsMenu") && data != null) {
      this.onCreateOptionsMenu((Menu)data);
    }

    if (id.equals("onOptionsItemSelected") && data != null) {
      this.onOptionsItemSelected((MenuItem)data);
    }

    if (id.equals("hostedWebApp_manifestLoaded") && data != null) {
      this.manifest = new Manifest((JSONObject)data);
      this.activity.invalidateOptionsMenu();
    }

    return null;
  }

  private void onCreateOptionsMenu(Menu menu) {
    int groupId = 0;

    if (this.manifest != null && this.manifest.getShare().isEnabled()) {
      appendShareActionsToActionBarMenu(menu, groupId);
    }
  }

  private void onOptionsItemSelected(MenuItem item) {
    int id = item.getItemId();

    if (id == mShareItemId) {
      doShare();
    }
  }

  private Intent doShare() {
    return this.doShare(null);
  }

  // Share intent TODO: would need to implement special cases for sharing across various social media, at the moment it's the lowest common denominator - URL only.
  private Intent doShare(String url) {
    // share text
    String shareURL = ShareConfig.CURRENT_URL;

    if (url != null && !url.isEmpty()) {
      shareURL = url;
    } else {
      if (this.manifest != null && this.manifest.getShare().isEnabled()) {
        ShareConfig shareOptions = this.manifest.getShare();
        shareURL = shareOptions.getUrl();
      }
    }

    // share link
    if (shareURL.equalsIgnoreCase(ShareConfig.CURRENT_URL)) {
      shareURL = this.webView.getUrl();
    }

    // share image
    //Uri path = Uri.parse(String.format("android.resource://%s/%s", this.getPackageName(), getResources().getDrawable(R.drawable.ic_launcher) ));

    // sharing intent
    Intent intent = new Intent(Intent.ACTION_SEND);
    intent.setType("text/plain"); // "text/plain" "text/html" "image/*" "*/*"
    intent.putExtra(Intent.EXTRA_TEXT, shareURL ); // shareMessage // only a link is supported by FaceBook! (See bug report: https://developers.facebook.com/x/bugs/332619626816423/ and http://stackoverflow.com/questions/13286358/sharing-to-facebook-twitter-via-share-intent-android)
    this.activity.startActivity(Intent.createChooser(intent, "Share via")); // Share via
    return intent;
  }

  private void appendShareActionsToActionBarMenu(Menu menu, int groupId) {
    if (this.manifest != null && this.manifest.getShare().isEnabled()) {
      ShareConfig shareConfig = this.manifest.getShare();
      // Easy Share Action requires API Level 14
      if (Build.VERSION.SDK_INT > 13) {
        menu.add(groupId, mShareItemId, mShareItemId, shareConfig.getButtonText());
        MenuItem menuItem = menu.findItem(mShareItemId);
        mShareActionProvider = (ShareActionProvider) menuItem.getActionProvider();
      }
    }
  }
}

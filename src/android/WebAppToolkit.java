package com.microsoft.webapptoolkit;

import android.content.Intent;
import android.os.Build;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.widget.ShareActionProvider;

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
  private JSONObject manifestObject;

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.activity = (CordovaActivity)cordova.getActivity();

    this.activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        WebAppToolkit me = WebAppToolkit.this;
      }
    });
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
      this.manifestObject = (JSONObject)data;
      this.activity.invalidateOptionsMenu();
    }

    return null;
  }

  private void onCreateOptionsMenu(Menu menu) {
    int groupId = 0;

    appendShareActionsToActionBarMenu(menu, groupId);
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
    String shareURL = "{currentURL}";

    if (url != null && !url.isEmpty()) {
      shareURL = url;
    } else {
      if (this.manifestObject != null) {
        // TODO read the share url from the manifest
      }
    }

    // share link
    if( shareURL.equalsIgnoreCase("{currentURL}")) {
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
    // Easy Share Action requires API Level 14
    if (Build.VERSION.SDK_INT > 13) {
      menu.add(groupId, mShareItemId, mShareItemId, "Share");
      MenuItem menuItem = menu.findItem(mShareItemId);
      mShareActionProvider = (ShareActionProvider) menuItem.getActionProvider();
    }
  }
}

package com.microsoft.webapptoolkit;

import android.app.Activity;
import android.content.res.AssetManager;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.LinearLayout;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

/**
* This class ...
*/
public class WebAppToolkit extends CordovaPlugin {

  private Activity activity;

  @Override
  public void initialize(CordovaInterface cordova, CordovaWebView webView) {
    super.initialize(cordova, webView);
    this.activity = cordova.getActivity();

    this.activity.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        WebAppToolkit me = WebAppToolkit.this;

      }
    });
  }

  @Override
  public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
    if (action.equals("initialize")) {
      // TODO
    } else {
      return false;
    }

    return true;
  }

  @Override
  public Object onMessage(String id, Object data) {
    if (id.equals("networkconnection") && data != null) {
      //handleNetworkConnectionChange(data.toString());
    }
    return null;
  }
}

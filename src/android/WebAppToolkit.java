package com.microsoft.webapptoolkit;

import android.content.Intent;
import android.os.Build;
import android.util.Base64;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;

import com.microsoft.hostedwebapp.HostedWebApp;

import com.microsoft.webapptoolkit.model.CustomScriptConfig;
import com.microsoft.webapptoolkit.model.Manifest;
import com.microsoft.webapptoolkit.model.ShareConfig;
import com.microsoft.webapptoolkit.model.StylesConfig;
import com.microsoft.webapptoolkit.utils.Assets;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.List;

/**
* This class ...
*/
public class WebAppToolkit extends CordovaPlugin {

  private CordovaActivity activity;

  private Manifest manifest;

  @Override
  public void pluginInitialize() {
    this.activity = (CordovaActivity) this.cordova.getActivity();

    Window window = this.activity.getWindow();
    if (Build.VERSION.SDK_INT > 10) {
      if (!window.hasFeature(Window.FEATURE_ACTION_BAR)) {
        Log.e("WAT-Initialization", "ActionBar feature not available, Window.FEATURE_ACTION_BAR must be enabled!. Try changing the theme.");
      }
    }

    HostedWebApp hostedAppPlugin = (HostedWebApp) this.webView.pluginManager.getPlugin("HostedWebApp");
    if (hostedAppPlugin != null) {
      JSONObject manifestObject = hostedAppPlugin.getManifest();

      if (manifestObject != null) {
        this.manifest = new Manifest(manifestObject);
        this.initialize();
      }
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
      this.initialize();
    } else {
      return false;
    }

    return true;
  }

  public void initialize() {
    if (this.manifest != null) {
      String name = this.manifest.getShortName();
      if (name == null || name == "") {
        name = this.manifest.getName();
      }

      if (Build.VERSION.SDK_INT > 10) {
        this.activity.getActionBar().setTitle(name);
      }

      this.activity.setTitle(name);
    }

    this.activity.invalidateOptionsMenu();
  }

  @Override
  public Object onMessage(String id, Object data) {
    if (id.equals("onCreateOptionsMenu") && data != null) {
      this.onCreateOptionsMenu((Menu) data);
    }

    if (id.equals("onOptionsItemSelected") && data != null) {
      this.onOptionsItemSelected((MenuItem) data);
    }

    if (id.equals("hostedWebApp_manifestLoaded") && data != null) {
      this.manifest = new Manifest((JSONObject) data);
      this.initialize();
    }

    if (id.equals("onPageFinished") && this.manifest != null) {
      this.injectCustomScripts();
      this.injectStyles();
    }

    return null;
  }

  private void onCreateOptionsMenu(Menu menu) {
    if (this.manifest != null) {
      //Clear menu to remove any old entities
      menu.clear();

      addAppBarButtonsToActionBarMenu(menu);
      appendShareActionsToActionBarMenu(menu);
    }
  }

  private void onOptionsItemSelected(MenuItem item) {
    int id = item.getItemId();
  }

  // Begin Share
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
    intent.putExtra(Intent.EXTRA_TEXT, shareURL); // shareMessage // only a link is supported by FaceBook! (See bug report: https://developers.facebook.com/x/bugs/332619626816423/ and http://stackoverflow.com/questions/13286358/sharing-to-facebook-twitter-via-share-intent-android)
    this.activity.startActivity(Intent.createChooser(intent, "Share via")); // Share via
    return intent;
  }

  private void appendShareActionsToActionBarMenu(Menu menu) {
    if (this.manifest != null && this.manifest.getShare().isEnabled()) {
      ShareConfig shareConfig = this.manifest.getShare();
      // Easy Share Action requires API Level 14
      if (Build.VERSION.SDK_INT > 13) {
        MenuItem menuItem = menu.add(shareConfig.getButtonText());
        menuItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_IF_ROOM);
        menuItem.setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
          @Override
          public boolean onMenuItemClick(MenuItem arg0) {
            doShare();
            return false;
          }
        });
      }
    }
  }

  // End Share

  // Begin JS and Styles injection

  private void evalJS(final String action) {
    if (action != null && action != "") {
      if (cordova.getActivity().getApplicationInfo().targetSdkVersion < Build.VERSION_CODES.KITKAT) {
        webView.loadUrl("javascript:" + action);
      } else {
        webView.evaluateJavascript(action, null);
      }
    }
  }

  private void injectScript(String scriptContent) {
    if (scriptContent != null && scriptContent != "") {
      String script = "(function() {"
      + "var element = document.createElement('script');"
      + "element.type = 'text/javascript';"
      + "element.innerHTML = window.atob('" + scriptContent + "');"
      + "document.head.appendChild(element)" + "})()";

      this.evalJS(script);
    }
  }

  private void injectScriptFile(String fileName) {
    String fileContent = Assets.readEncoded(fileName, this.cordova.getActivity());
    this.injectScript(fileContent);
  }

  private void injectCustomScripts() {
    CustomScriptConfig config = this.manifest.getCustomScript();

    if (config.isEnabled()) {
      List<String> scriptFiles = config.getScriptFiles();
      for (String file : scriptFiles) {
        this.injectScriptFile(file);
      }

      String customString = config.getCustomString();
      String encodedScript = Base64.encodeToString(customString.getBytes(), Base64.NO_WRAP);
      this.injectScript(encodedScript);
    }
  }

  private void injectStyle(String styleContent) {
    if (styleContent != null && styleContent != "") {
      String script = "(function() {"
      + "var element = document.createElement('style');"
      + "element.type = 'text/css';"
      + "element.innerHTML = window.atob('" + styleContent + "');"
      + "document.head.appendChild(element)" + "})()";

      this.evalJS(script);
    }
  }

  private void injectStyleFile(String fileName) {
    String fileContent = Assets.readEncoded(fileName, this.cordova.getActivity());
    this.injectStyle(fileContent);
  }

  private void injectStyles() {
    StylesConfig config = this.manifest.getStyles();

    if (config.isEnabled()) {
      List<String> scriptFiles = config.getCssFiles();
      for (String file : scriptFiles) {
        this.injectStyleFile(file);
      }

      String customString = config.getInlineStyles();
      String encodedStyles = Base64.encodeToString(customString.getBytes(), Base64.NO_WRAP);
      this.injectStyle(encodedStyles);
    }
  }

  // End JS and Styles injection

  // Begin AppBar
  private void addAppBarButtonsToActionBarMenu(Menu menu) {
    if (manifest != null && manifest.getAppBar() != null && manifest.getAppBar().isEnabled()) {
      for (final com.microsoft.webapptoolkit.model.MenuItem btn : manifest.getAppBar().getMenuItems()) {
        MenuItem menuItem = menu.add(btn.getLabel());
        if (Build.VERSION.SDK_INT > 10) {
          menuItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_IF_ROOM | MenuItem.SHOW_AS_ACTION_WITH_TEXT); // setShowAsAction requires API level 11
          int resId = this.getDrawableResource("ic_action_" + btn.getIcon()) | this.getDrawableResource(btn.getIcon());

          // Fallback to Android resources
          if (resId <= 0) {
            resId = this.getAndroidResource(btn.getIcon());
          }

          if (resId > 0) {
            menuItem.setIcon(resId); // R.drawable.ic_action_about
          }

          menuItem.setOnMenuItemClickListener(new MenuItem.OnMenuItemClickListener() {
            @Override
            public boolean onMenuItemClick(MenuItem arg) {
              doMenuAction(btn);
              return false;
            }
          });
        }
      }
    }
  }

  private void doMenuAction(com.microsoft.webapptoolkit.model.MenuItem btn) {
    if( btn.getAction().equalsIgnoreCase("eval") ) {
      // eval javascript
      this.evalJS(btn.getData());
    } else {
      // handle URL
      this.webView.loadUrlIntoView(btn.getAction(), false);
    }
  }

  public int getAndroidResource(String res) {
    return getResourceId(res, "drawable", "android");
  }

  public int getDrawableResource(String imgName) {
    return getResourceId(imgName, "drawable", activity.getPackageName());
  }

  public int getResourceId(String variableName, String resourceName, String pPackageName) {
    try {
      return activity.getResources().getIdentifier(variableName, resourceName, pPackageName);
    } catch (Exception e) {
      e.printStackTrace();
      return -1;
    }
  }

  // End AppBar
}

package com.microsoft.webapptoolkit;

import java.util.ArrayList;
import java.util.List;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.ActionBar;
import android.content.Context;
import android.os.Build;
import android.util.Log;
import android.view.Window;

import com.manifoldjs.hostedwebapp.HostedWebApp;
import com.microsoft.webapptoolkit.model.Manifest;
import com.microsoft.webapptoolkit.modules.*;

/**
 * This class ...
 */
public class WebAppToolkit extends CordovaPlugin {

	private CordovaActivity activity;
	private Manifest manifest;
	private List<IModule> modules = new ArrayList<IModule>();

	@Override
	public void pluginInitialize() {
		this.activity = (CordovaActivity) this.cordova.getActivity();

		Window window = this.activity.getWindow();
		if (Build.VERSION.SDK_INT > 10) {
			if (!window.hasFeature(Window.FEATURE_ACTION_BAR)) {
				Log.e("WAT-Initialization",
						"ActionBar feature not available, Window.FEATURE_ACTION_BAR must be enabled!. Try changing the theme.");
			}
		}

		HostedWebApp hostedAppPlugin = (HostedWebApp) this.webView.getPluginManager()
				.getPlugin("HostedWebApp");
		if (hostedAppPlugin != null) {
			JSONObject manifestObject = hostedAppPlugin.getManifest();

			if (manifestObject != null) {
				this.manifest = new Manifest(manifestObject);
				this.initialize();
			}
		}
	}

    /**
     * Hook for blocking navigation by the Cordova WebView. This applies both to top-level and
     * iframe navigations.
     *
     * This will be called when the WebView's needs to know whether to navigate
     * to a new page. Return false to block the navigation: if any plugin
     * returns false, Cordova will block the navigation. If all plugins return
     * null, the default policy will be enforced. It at least one plugin returns
     * true, and no plugins return false, then the navigation will proceed.
     */
    public Boolean shouldAllowNavigation(String url) {
        boolean shouldAllowRequest;
        for (IModule m : this.modules) {
            shouldAllowRequest = m.shouldAllowRequest(url);
            if (!shouldAllowRequest) return false;
        }
        return super.shouldAllowNavigation(url);
    }

	/**
	 * Called when the URL of the webview changes.
	 *
	 * @param url               The URL that is being changed to.
	 * @return                  Return false to allow the URL to load, return true to prevent the URL from loading.
	 */
	@Override
	public boolean onOverrideUrlLoading(String url) {
		boolean shouldAllowRequest;
		for (IModule m : this.modules) {
			shouldAllowRequest = m.shouldAllowRequest(url);
			if (shouldAllowRequest) return false;
		}
		return super.onOverrideUrlLoading(url);
	}

	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {

		return false;
	}

	public void initialize() {
		if (this.manifest != null) {

			/* New Module Implementation */
			this.modules = new ArrayList<IModule>();
			this.modules.add(InjectionModule.getInstance(this));
			this.modules.add(RedirectsModule.getInstance(this));

			String name = this.manifest.getShortName();
			if (name == null || name == "") {
				name = this.manifest.getName();
			}

			if (Build.VERSION.SDK_INT > 10) {
				ActionBar actionBar = this.activity.getActionBar();

				if (actionBar != null) {
					actionBar.setTitle(name);
				}
			}
			this.activity.setTitle(name);
		}
		this.activity.invalidateOptionsMenu();
	}

	@Override
	public Object onMessage(String id, Object data) {
		if (id.equals("hostedWebApp_manifestLoaded") && data != null) {
			this.manifest = new Manifest((JSONObject) data);
			this.initialize();
		}

		if (id.equals("onPageFinished") && this.manifest != null) {
			broadcastMessage(Constants.ON_PAGE_FINISHED, data);
		}

		if (id.equals("onPageStarted") && this.manifest != null) {
			broadcastMessage(Constants.ON_PAGE_STARTED, data);
		}

		return null;
	}

	private void broadcastMessage(String messageId, Object data) {
		for (IModule m : this.modules) {
			m.onMessage(messageId, data);
		}
	}

	private void broadcastMessage(String messageId) {
		broadcastMessage(messageId, null);
	}

	public Manifest getManifest() {
		return this.manifest;
	}

	public Context getContext() {
		return this.activity;
	}
}

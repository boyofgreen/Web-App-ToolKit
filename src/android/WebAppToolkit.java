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
import android.os.Build;
import android.util.Log;
import android.view.Window;
import com.microsoft.hostedwebapp.HostedWebApp;
import com.microsoft.webapptoolkit.model.Manifest;
import com.microsoft.webapptoolkit.modules.IModule;
import com.microsoft.webapptoolkit.modules.InjectionModule;
import com.microsoft.webapptoolkit.modules.RedirectsModule;

/**
 * This class ...
 */
public class WebAppToolkit extends CordovaPlugin {

	private CordovaActivity activity;
	private Manifest manifest;
	private List<IModule> modules;

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

	@Override
	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {

        return false;
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

    @Override
    public Boolean shouldAllowNavigation(String url) {
        for (IModule m : this.modules) {
            if (m.onNavigationAttempt(url)) {
                return null;
            }
        }

        return null; // Default policy
    }

	public void initialize() {
		if (this.manifest != null) {

			/* New Module Implementation */
			this.modules = new ArrayList<IModule>();
			this.modules.add(InjectionModule.getInstance(this));
			this.modules.add(RedirectsModule.getInstance(this));
			/* End New Module Implementation */

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

    private void broadcastMessage(String messageId, Object data) {
        for (IModule m : this.modules) {
            m.onMessage(messageId, data);
        }
    }

    public Manifest getManifest() {
        return this.manifest;
    }
}

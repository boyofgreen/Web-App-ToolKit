package com.manifoldjs.webapptoolkit;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaActivity;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.ActionBar;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.view.Menu;
import android.view.Window;
import com.manifoldjs.hostedwebapp.HostedWebApp;
import com.manifoldjs.webapptoolkit.model.Manifest;
import com.manifoldjs.webapptoolkit.modules.IModule;
import com.manifoldjs.webapptoolkit.modules.InjectionModule;
import com.manifoldjs.webapptoolkit.modules.RedirectsModule;

/**
 * This class ...
 */
public class WebAppToolkit extends CordovaPlugin {

	private CordovaActivity activity;
	private Manifest manifest;
	private List<IModule> modules;
	private Menu menu;

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
	public void onPause(boolean multitasking) {
		super.onPause(multitasking);
		for (IModule m : this.modules) {
			m.unsubscribe();
		}
	}

	@Override
	public void onResume(boolean multitasking) {
		super.onResume(multitasking);

		for (IModule m : this.modules) {
			m.subscribe();
		}
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

			for (IModule m : this.modules) {
				m.subscribe();
			}

			/* End New Module Implementation */

			LocalBroadcastManager.getInstance(this.activity).sendBroadcast(
					new Intent(Constants.ON_INITIALIZE));

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
			LocalBroadcastManager.getInstance(this.activity).sendBroadcast(
					new Intent(Constants.ON_PAGE_FINISHED));
		}

		if (id.equals("onPageStarted") && this.manifest != null) {
			Intent intent = new Intent(Constants.ON_PAGE_STARTED).putExtra(
					"message", (String) data);
			LocalBroadcastManager.getInstance(this.activity).sendBroadcast(
					intent);
		}

		return null;
	}

	// End review Functionality

	public Manifest getManifest() {
		return this.manifest;
	}

	public Context getContext() {
		return this.activity;
	}
}

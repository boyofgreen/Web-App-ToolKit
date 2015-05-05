package com.manifoldjs.webapptoolkit.modules;

import java.util.List;
import java.util.Locale;

import org.apache.cordova.CordovaActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Base64;

import com.manifoldjs.webapptoolkit.model.Manifest;
import com.manifoldjs.webapptoolkit.Constants;
import com.manifoldjs.webapptoolkit.WebAppToolkit;
import com.manifoldjs.webapptoolkit.config.CustomScriptConfig;
import com.manifoldjs.webapptoolkit.config.StylesConfig;
import com.manifoldjs.webapptoolkit.utils.Assets;

public class InjectionModule implements IModule{

    private static final String CONFIG_PATH_JAVASCRIPT = "custom_js_path";
    private static final String CONFIG_PATH_STYLESHEET = "custom_css_path";

	private StylesConfig stylesConfig = null;
	private CustomScriptConfig scriptConfig = null;
	private WebAppToolkit webAppToolkit = null;
	private BroadcastReceiver mInjectionBroadcast;
	private CordovaActivity activity;
    private Boolean isSubscribed = false;

	private static InjectionModule instance;

	private InjectionModule(WebAppToolkit webAppToolkit) {
		this.webAppToolkit = webAppToolkit;
		this.activity = (CordovaActivity) this.webAppToolkit.cordova.getActivity();
        this.updateConfiguration(this.webAppToolkit.getManifest());
	}

	public static InjectionModule getInstance(WebAppToolkit webAppToolkit){
		if(instance == null) {
            instance = new InjectionModule(webAppToolkit);
        } else {
            instance.updateConfiguration(webAppToolkit.getManifest());
        }
		return instance;
	}

	@Override
	public void unsubscribe() {
        if (isSubscribed) {
            LocalBroadcastManager.getInstance(webAppToolkit.getContext()).unregisterReceiver(mInjectionBroadcast);
            isSubscribed = false;
        }
	}

	@Override
	public void subscribe() {
        if (!isSubscribed) {
            this.mInjectionBroadcast = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    inject();
                }
            };

            LocalBroadcastManager.getInstance(webAppToolkit.getContext())
                    .registerReceiver(mInjectionBroadcast,
                            new IntentFilter(Constants.ON_PAGE_FINISHED));

            isSubscribed = true;
        }
	}

	public void inject() {
		this.injectCustomScripts();
		this.injectStyles();
	}

	// Begin JS and Styles injection

	private void evalJS(final String action) {
		if (action != null && action != "") {
			this.webAppToolkit.webView.loadUrl("javascript:" + action);
		}
	}

	private void injectScript(String scriptContent) {
		if (scriptContent != null && scriptContent != "") {
			String script = "(function() {"
					+ "var element = document.createElement('script');"
					+ "element.type = 'text/javascript';"
					+ "element.innerHTML = window.atob('" + scriptContent
					+ "');" + "document.head.appendChild(element)" + "})()";

			this.evalJS(script);
		}
	}

	private void injectScriptFile(String fileName) {
		String fileContent = Assets.readEncoded(fileName,
                this.activity);
		this.injectScript(fileContent);
	}

	private void injectCustomScripts() {

		if (this.scriptConfig.isEnabled()) {
			List<String> scriptFiles = this.scriptConfig.getScriptFiles();
			for (String file : scriptFiles) {
				this.injectScriptFile(file);
			}

			String customString = this.scriptConfig.getCustomString();
			String encodedScript = Base64.encodeToString(
					customString.getBytes(), Base64.NO_WRAP);
			this.injectScript(encodedScript);
		}
	}

	private void injectStyle(String styleContent) {
		if (styleContent != null && styleContent != "") {
			String script = "(function() {"
					+ "var element = document.createElement('style');"
					+ "element.type = 'text/css';"
					+ "element.innerHTML = window.atob('" + styleContent
					+ "');" + "document.head.appendChild(element)" + "})()";

			this.evalJS(script);
		}
	}

	private void injectStyleFile(String fileName) {
		String fileContent = Assets.readEncoded(fileName,
				this.activity);
		this.injectStyle(fileContent);
	}

	private void injectStyles() {

		if (this.stylesConfig.isEnabled()) {
			List<String> scriptFiles = this.stylesConfig.getCssFiles();
			for (String file : scriptFiles) {
				this.injectStyleFile(file);
			}

			String customString = this.stylesConfig.getInlineStyles();
			String encodedStyles = Base64.encodeToString(
					customString.getBytes(), Base64.NO_WRAP);
			this.injectStyle(encodedStyles);
		}
	}

    private void updateConfiguration(Manifest manifest) {

        // Update custom file path (if defined)
        try {
            String keyvalue;

            keyvalue = activity.getIntent().getStringExtra(
                    CONFIG_PATH_JAVASCRIPT.toLowerCase(Locale.getDefault()));
            if (keyvalue != null) {
                manifest.getCustomScript().setCustomFilePath(keyvalue);
            }
            keyvalue = activity.getIntent().getStringExtra(
                    CONFIG_PATH_STYLESHEET.toLowerCase(Locale.getDefault()));
            if (keyvalue != null) {
                manifest.getStyles().setCustomFilePath(keyvalue);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }

        this.scriptConfig = manifest.getCustomScript();
        this.stylesConfig = manifest.getStyles();
    }

	// End JS and Styles injection
}

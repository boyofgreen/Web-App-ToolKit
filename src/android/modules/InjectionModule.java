package com.microsoft.webapptoolkit.modules;

import java.util.List;
import java.util.Locale;

import org.apache.cordova.CordovaActivity;

import android.util.Base64;

import com.microsoft.webapptoolkit.Constants;
import com.microsoft.webapptoolkit.WebAppToolkit;
import com.microsoft.webapptoolkit.config.CustomScriptConfig;
import com.microsoft.webapptoolkit.config.StylesConfig;
import com.microsoft.webapptoolkit.model.Manifest;
import com.microsoft.webapptoolkit.utils.Assets;

public class InjectionModule extends IModule{
	private WebAppToolkit webAppToolkit = null;
	private CordovaActivity activity;

	private static InjectionModule instance;

	private InjectionModule(WebAppToolkit webAppToolkit) {
		this.webAppToolkit = webAppToolkit;
		this.activity = (CordovaActivity) this.webAppToolkit.cordova.getActivity();
	}

	public static InjectionModule getInstance(WebAppToolkit webAppToolkit){
		if(instance == null)
			instance = new InjectionModule(webAppToolkit);

		return instance;
	}

	@Override
	public Object onMessage(String id, Object data) {
		if (id.equals(Constants.ON_PAGE_FINISHED)) {
			inject();
		}
		return null;
	}

	public void inject() {
		this.injectCustomScripts();
		this.injectStyles();
	}

	// Begin JS and Styles injection

	private void evalJS(final String action) {
		if (action != null && action != "") {
			this.webAppToolkit.webView.getEngine().loadUrl("javascript:" + action, false);
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
        CustomScriptConfig scriptConfig = this.webAppToolkit.getManifest().getCustomScript();
  
		if (scriptConfig.isEnabled()) {
			List<String> scriptFiles = scriptConfig.getScriptFiles();
			for (String file : scriptFiles) {
				this.injectScriptFile(file);
			}

			String customString = scriptConfig.getCustomString();
            if (customString != null) {
                String encodedScript = Base64.encodeToString(
                        customString.getBytes(), Base64.NO_WRAP);
                this.injectScript(encodedScript);
            }
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
        StylesConfig stylesConfig = this.webAppToolkit.getManifest().getStyles();
  
		if (stylesConfig.isEnabled()) {
			List<String> scriptFiles = stylesConfig.getCssFiles();
			for (String file : scriptFiles) {
				this.injectStyleFile(file);
			}

			String customString = stylesConfig.getInlineStyles();
            if (customString != null) {
                String encodedStyles = Base64.encodeToString(
                        customString.getBytes(), Base64.NO_WRAP);
                this.injectStyle(encodedStyles);
            }
		}
	}
}

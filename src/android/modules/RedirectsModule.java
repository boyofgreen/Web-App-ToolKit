package com.microsoft.webapptoolkit.modules;

import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.Hashtable;
import java.util.regex.Matcher;

import org.apache.cordova.CordovaActivity;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.microsoft.webapptoolkit.Constants;
import com.microsoft.webapptoolkit.ModalActivity;
import com.microsoft.webapptoolkit.WebAppToolkit;
import com.microsoft.webapptoolkit.config.RedirectRulesConfig;
import com.microsoft.webapptoolkit.config.RedirectsConfig;

public class RedirectsModule extends IModule {

	private WebAppToolkit webAppToolkit = null;
	private CordovaActivity activity;
	private static RedirectsModule instance;

	private RedirectsModule(WebAppToolkit webAppToolkit) {
		this.webAppToolkit = webAppToolkit;
		this.activity = (CordovaActivity) webAppToolkit.cordova.getActivity();
	}

	public static RedirectsModule getInstance(WebAppToolkit webAppToolkit) {
		if (instance == null)
			instance = new RedirectsModule(webAppToolkit);
		return instance;
	}

	@Override
	public boolean shouldAllowRequest(String url) {
		RedirectsConfig redirectsConfig = this.webAppToolkit.getManifest()
				.getRedirectsConfig();
		if (redirectsConfig.isEnabled() && redirectsConfig.hasRules()) {
			int rulesSize = redirectsConfig.getRules().size();

			for (int i = 0; i < rulesSize; i++) {
				RedirectRulesConfig rule = redirectsConfig.getRules().get(i);
				Matcher matcher = rule.getRegexPattern().matcher(url);
				if (matcher.find()) {
					switch (rule.getActionType()) {
						case showMessage:
							Toast toast = Toast.makeText(
									this.activity,
									rule.getMessage(), Toast.LENGTH_LONG);
							LinearLayout layout = (LinearLayout) toast.getView();
							if (layout.getChildCount() > 0) {
								TextView textView = (TextView) layout.getChildAt(0);
								textView.setGravity(Gravity.CENTER_VERTICAL
										| Gravity.CENTER_HORIZONTAL);
							}
							toast.show();
							break;
						case popout:
							launchUrlInBrowser(url);
							break;
						case redirect:
							String redirectUrl = rule.getUrl();
							if (redirectsConfig.isEnableCaptureWindowOpen()) {
								this.webAppToolkit.webView.loadUrl(redirectUrl);
							} else {
								launchUrlInBrowser(url);
							}
							break;
						case modal:
							Intent intent = new Intent(
									this.activity,
									ModalActivity.class);
							intent.putExtra(Constants.MODAL_ORIGINAL_URL, url);
							intent.putExtra(Constants.MODAL_CLOSE_ON_MATCH,
									rule.getCloseOnMatch());
							intent.putExtra(Constants.MODAL_CLOSE_ON_MATCH_PATTERN,
									rule.getCloseOnMatchPattern());
							intent.putExtra(Constants.MODAL_HIDE_BACK_BUTTON,
									rule.isHideCloseButton());
							this.activity
									.startActivityForResult(intent,
											Constants.MODAL_REQUEST_CODE);
							break;
						case unknown:
							Log.w("WAT-redirects", "Unspecified rule action type: "
									+ rule.getAction());
							break;
					}

					return true;
				}
			}
		}
		return false;
	}

	private void launchUrlInBrowser(String url) {
		this.activity.startActivity(new Intent(Intent.ACTION_VIEW).setData(Uri.parse(url)));
	}

}

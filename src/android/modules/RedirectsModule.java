package com.manifoldjs.webapptoolkit.modules;

import java.util.regex.Matcher;

import org.apache.cordova.CordovaActivity;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.manifoldjs.webapptoolkit.Constants;
import com.manifoldjs.webapptoolkit.ModalActivity;
import com.manifoldjs.webapptoolkit.WebAppToolkit;
import com.manifoldjs.webapptoolkit.config.RedirectRulesConfig;
import com.manifoldjs.webapptoolkit.config.RedirectsConfig;

public class RedirectsModule implements IModule {

	private RedirectsConfig redirectsConfig = null;
	private WebAppToolkit webAppToolkit = null;
	private BroadcastReceiver mRedirectsMessage;
	private CordovaActivity activity;
	private static RedirectsModule instance;

	private RedirectsModule(WebAppToolkit webAppToolkit) {
		this.webAppToolkit = webAppToolkit;
		this.redirectsConfig = this.webAppToolkit.getManifest()
				.getRedirectsConfig();
		this.activity = (CordovaActivity) webAppToolkit.cordova.getActivity();
		this.subscribe();
	}

	public static RedirectsModule getInstance(WebAppToolkit webAppToolkit) {
		if (instance == null)
			instance = new RedirectsModule(webAppToolkit);
		return instance;
	}

	@Override
	public void unsubscribe() {
		LocalBroadcastManager.getInstance(webAppToolkit.getContext())
				.unregisterReceiver(mRedirectsMessage);
	}

	@Override
	public void subscribe() {
		this.mRedirectsMessage = new BroadcastReceiver() {
			@Override
			public void onReceive(Context context, Intent intent) {
				handle(intent.getStringExtra("message"));
			}
		};

		LocalBroadcastManager.getInstance(webAppToolkit.getContext())
				.registerReceiver(mRedirectsMessage,
						new IntentFilter(Constants.ON_PAGE_STARTED));
	}

	public void handle(String data) {
		if (this.redirectsConfig.isEnabled() && redirectsConfig.hasRules()) {
			int rulesSize = redirectsConfig.getRules().size();
			for (int i = 0; i < rulesSize; i++) {
				RedirectRulesConfig rule = redirectsConfig.getRules().get(i);
				Matcher matcher = rule.getRegexPattern().matcher(data);
				if (matcher.find()) {
					boolean intercepted = false;
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
						launchUrlInBrowser(data);
						intercepted = true;
						break;
					case redirect:
						String redirectUrl = rule.getUrl();
						if (redirectsConfig.isEnableCaptureWindowOpen()) {
							this.webAppToolkit.webView.loadUrl(redirectUrl);
						} else {
							launchUrlInBrowser(data);
							intercepted = true;
						}
						break;
					case modal:
						Intent intent = new Intent(
								this.activity,
								ModalActivity.class);
						intent.putExtra(Constants.MODAL_ORIGINAL_URL, data);
						intent.putExtra(Constants.MODAL_CLOSE_ON_MATCH,
								rule.getCloseOnMatch());
						intent.putExtra(Constants.MODAL_CLOSE_ON_MATCH_PATTERN,
								rule.getCloseOnMatchPattern());
						intent.putExtra(Constants.MODAL_HIDE_BACK_BUTTON,
								rule.isHideCloseButton());
						this.activity
								.startActivityForResult(intent,
										Constants.MODAL_REQUEST_CODE);
						intercepted = true;
						break;
					case unknown:
						Log.w("WAT-redirects", "Unspecified rule action type: "
								+ rule.getAction());
						break;
					}

					if (intercepted)
						this.webAppToolkit.webView.stopLoading();
				}
			}
		}
	}

	private void launchUrlInBrowser(String url) {
		this.activity.startActivity(new Intent(Intent.ACTION_VIEW).setData(Uri.parse(url)));
	}

}

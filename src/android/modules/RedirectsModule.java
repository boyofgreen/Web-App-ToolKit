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

	private WebAppToolkit webAppToolkit = null;
	private BroadcastReceiver mRedirectsMessage;
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
    public Object onMessage(String id, Object data) {
        if (id.equals(Constants.ON_PAGE_STARTED)) {
            //handle((String)data);
        }
        return null;
    }

    @Override
    public Boolean onNavigationAttempt(String url) {
        return handle(url);
    }

    public Boolean handle(String url) {
        RedirectsConfig redirectsConfig = this.webAppToolkit.getManifest().getRedirectsConfig();

        if (redirectsConfig.isEnabled() && redirectsConfig.hasRules()) {
            int rulesSize = redirectsConfig.getRules().size();
            for (int i = 0; i < rulesSize; i++) {
                RedirectRulesConfig rule = redirectsConfig.getRules().get(i);
                Matcher matcher = rule.getRegexPattern().matcher(url);
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
                            launchUrlInBrowser(url);
                            intercepted = true;
                            break;
                        case redirect:
                            String redirectUrl = rule.getUrl();
                            if (redirectsConfig.isEnableCaptureWindowOpen()) {
                                this.webAppToolkit.webView.loadUrl(redirectUrl);
                            } else {
                                launchUrlInBrowser(url);
                                intercepted = true;
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
                            intercepted = true;
                            break;
                        case unknown:
                            Log.w("WAT-redirects", "Unspecified rule action type: "
                                    + rule.getAction());
                            break;
                    }

                    if (intercepted) {
                        this.webAppToolkit.webView.stopLoading();
                        return true;
                    }
                }
            }
        }

        return false;
    }

	private void launchUrlInBrowser(String url) {
		this.activity.startActivity(new Intent(Intent.ACTION_VIEW).setData(Uri.parse(url)));
	}
}

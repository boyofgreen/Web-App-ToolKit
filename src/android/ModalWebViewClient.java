package com.manifoldjs.webapptoolkit;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import android.content.Context;
import android.content.Intent;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class ModalWebViewClient extends WebViewClient {

	WebViewCallbacks mListener;
  Context mContext;
  String mPatternToMatchForClose;
  Pattern mMatchForClosePattern;

  public interface WebViewCallbacks {
    public void onResponseError(int errorCode, String description);
    public void onModalFinished(int code, Intent data);
}

  public ModalWebViewClient(Context context, WebViewCallbacks listener, String patterToMatchForClose, Pattern matchForClosePattern) {
      if (context == null) {
          throw new IllegalArgumentException("context is a required parameter");
      }

      this.mListener = listener;
      this.mContext = context;
      this.mPatternToMatchForClose = patterToMatchForClose;
      this.mMatchForClosePattern = matchForClosePattern;
  }

  @Override
  public boolean shouldOverrideUrlLoading(WebView view, String url) {
      Matcher matcher = mMatchForClosePattern.matcher(url);
      if (matcher.find()) {
          //Trigger activity close
          Intent intent = new Intent();
          intent.putExtra(Constants.MODAL_RESPONSE_URL, url);
          mListener.onModalFinished(Constants.MODAL_RESPONSE_CODE, intent);
          return true;
      }
      return super.shouldOverrideUrlLoading(view, url);
  }
}

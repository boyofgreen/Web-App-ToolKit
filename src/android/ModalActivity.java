package com.microsoft.webapptoolkit;

import java.util.regex.Pattern;

import android.app.Activity;
import android.app.Fragment;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import android.widget.FrameLayout;
import android.widget.RelativeLayout;

import com.microsoft.webapptoolkit.ModalWebViewClient.WebViewCallbacks;

public class ModalActivity extends Activity implements WebViewCallbacks {

  private PlaceholderFragment mPlaceholderFragment;
  private boolean mHideBackButton;

  private static final int FRAME_LAYOUT_ID = 999;


  @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);

      RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT);

      FrameLayout fl = new FrameLayout(this);
      fl.setLayoutParams(layoutParams);
      fl.setId(FRAME_LAYOUT_ID);

      setContentView(fl);
      mPlaceholderFragment = new PlaceholderFragment();
      mPlaceholderFragment.setArguments(getIntent().getExtras());

      this.mHideBackButton = getIntent().getBooleanExtra(Constants.MODAL_HIDE_BACK_BUTTON, false);

      if (savedInstanceState == null) {
          getFragmentManager().beginTransaction()
                  .add(FRAME_LAYOUT_ID, mPlaceholderFragment)
                  .commit();
      }
  }


  @Override
  public boolean onCreateOptionsMenu(Menu menu) {
      // Inflate the menu; this adds items to the action bar if it is present.
      //getMenuInflater().inflate(R.menu.watmodal, menu);
      return true;
  }

  @Override
  public boolean onOptionsItemSelected(MenuItem item) {
      // Handle action bar item clicks here. The action bar will
      // automatically handle clicks on the Home/Up button, so long
      // as you specify a parent activity in AndroidManifest.xml.
      //int id = item.getItemId();
      /*
      if (id == R.id.action_settings) {
          return true;
      }
      */
      return super.onOptionsItemSelected(item);
  }

  @Override
  public void onModalFinished(int code, Intent data) {
      setResult(code, data);
      finish();
  }

  @Override
  public void onBackPressed() {
      if (mPlaceholderFragment != null && mPlaceholderFragment.handleBackButton() && !mHideBackButton) {
              super.onBackPressed();
      } else if (!mHideBackButton) {
              super.onBackPressed();
      }

  }

  /**
   * A placeholder fragment containing a simple view.
   */
  public static class PlaceholderFragment extends Fragment {

      private static WebView mWebView;
      private String mUrlToLoad;
      private String mPatternToMatchForClose;
      private Pattern mMatchForClosePattern;

      private WebViewCallbacks mCallbacks;
      private Context mContext;

      public PlaceholderFragment() {
      }

      @Override
      public View onCreateView(LayoutInflater inflater, ViewGroup container,
              Bundle savedInstanceState) {

      	RelativeLayout.LayoutParams layoutParams = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.MATCH_PARENT, RelativeLayout.LayoutParams.MATCH_PARENT);
				RelativeLayout rl = new RelativeLayout(getActivity());
				rl.setLayoutParams(layoutParams);

				mWebView = new WebView(getActivity());
				mWebView.setLayoutParams(layoutParams);

        configureWebView();
        this.mUrlToLoad = getArguments().getString(Constants.MODAL_ORIGINAL_URL);
        this.mPatternToMatchForClose = getArguments().getString(Constants.MODAL_CLOSE_ON_MATCH);
        this.mMatchForClosePattern = (Pattern) getArguments().get(Constants.MODAL_CLOSE_ON_MATCH_PATTERN);
//        Object obj = getArguments().get(Constants.MODAL_CLOSE_ON_MATCH_PATTERN);
        configureWebView();
        loadURL(this.mUrlToLoad);

        rl.addView(mWebView);

        return rl;
      }

      @Override
      public void onAttach(Activity activity) {
          super.onAttach(activity);
          this.mCallbacks = (WebViewCallbacks)activity;
          this.mContext = activity;
      }

      @Override
      public void onDetach() {
          super.onDetach();
          this.mCallbacks = null;
          this.mContext = null;
      }

      private void configureWebView()
      {
          if (mWebView != null) {
              mWebView.getSettings().setJavaScriptEnabled(true);
              mWebView.getSettings().setBuiltInZoomControls(false);
              mWebView.getSettings().setLoadsImagesAutomatically(true);
              mWebView.setScrollBarStyle(WebView.SCROLLBARS_OUTSIDE_OVERLAY);
              mWebView.setScrollbarFadingEnabled(true);
              mWebView.setWebViewClient(new ModalWebViewClient(mContext, mCallbacks, mPatternToMatchForClose, mMatchForClosePattern));
          }
      }

      public static void loadURL(String url)
      {
          if (mWebView != null)
          {
              mWebView.loadUrl(url);
          }
          else
          {
//              Log.e(Constants.TAG, "Error loading URL in modal webview");
          }
      }

      /**
       * Handles the back button being pressed.  While navigate back webpages if possible.
       * @return indicates if Activity back button activity should be performed by caller.
       */
      public boolean handleBackButton() {
          if (mWebView.canGoBack()) {
              mWebView.goBack();
              return false;
          } else {
              return true;
          }
      }
  }

	@Override
  public void onResponseError(int errorCode, String description) {

  }

}

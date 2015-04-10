package com.microsoft.webapptoolkit.utils;

import java.util.List;

import org.apache.cordova.CordovaPlugin;

import com.microsoft.sample.R;
import com.microsoft.webapptoolkit.model.MenuItem;

import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Build;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

public class NavDrawerListAdapter extends BaseAdapter {

  private Activity activity;
  private List<MenuItem> navDrawerItems;
  private int positionSelected;

  public NavDrawerListAdapter(Activity activity, List<MenuItem> navDrawerItems) {
    this.activity = activity;
    this.navDrawerItems = navDrawerItems;
  }

  @Override
  public int getCount() {
    return navDrawerItems.size();
  }

  @Override
  public Object getItem(int position) {
    return navDrawerItems.get(position);
  }

  @Override
  public long getItemId(int position) {
    return position;
  }

  @Override
  public View getView(int position, View convertView, ViewGroup parent) {
    if (convertView == null) {
      LayoutInflater mInflater = (LayoutInflater) activity.getSystemService(Activity.LAYOUT_INFLATER_SERVICE);

      convertView = mInflater.inflate(R.layout.drawer_list_item, null);
    }

    MenuItem menuItem = navDrawerItems.get(position);

    ImageView imgView = (ImageView) convertView.findViewById(R.id.icon);

    int resId = ResourceHelper.getResourceIconId(this.activity, menuItem.getIcon());

    if (resId > 0) {
      imgView.setImageResource(resId); // R.drawable.ic_action_about
    }

    TextView txtTitle = (TextView) convertView.findViewById(R.id.title);

    boolean isSelected = position == positionSelected;

    txtTitle.setText(menuItem.getLabel());
    txtTitle.setSelected(isSelected);
    txtTitle.setClickable(false);

    if (Build.VERSION.SDK_INT > 15) {
      convertView.setBackground(new ColorDrawable(isSelected ? Color.GRAY : Color.WHITE));
    }

    return convertView;
  }

  public void setItemSelected(int position) {
    positionSelected = position;
    this.notifyDataSetChanged();
  }
}

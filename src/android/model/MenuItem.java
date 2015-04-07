package com.microsoft.webapptoolkit.model;

public class MenuItem {
  private String label;
  private int iconResource;
  private String icon;
  private String action;

  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  public int getIconResource() {
    return iconResource;
  }

  public void setIconResource(int iconResource) {
    this.iconResource = iconResource;
  }

  public String getIcon() {
    return icon;
  }

  public void setIcon(String icon) {
    this.icon = icon;
  }

  public String getAction() {
    return action;
  }

  public void setAction(String action) {
    this.action = action;
  }

  public boolean hasAndroidIcon() {
    return icon != null && icon.startsWith("R.android");
  }
}

package com.eviden.tecradar.model;

public class UserSettingsDto {

  private Boolean showIconsInColor;
  private Boolean showIcons;

  public Boolean getShowIcons() {
    return showIcons;
  }

  public void setShowIcons(Boolean showIcons) {
    this.showIcons = showIcons;
  }

  public Boolean getShowIconsInColor() {
    return showIconsInColor;
  }

  public void setShowIconsInColor(Boolean showIconsInColor) {
    this.showIconsInColor = showIconsInColor;
  }
}

package com.eviden.tecradar.entity;

import com.eviden.tecradar.model.ThemeId;
import com.eviden.tecradar.model.UserSettingsDto;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.SequenceGenerator;
import java.util.ArrayList;
import java.util.List;

/** The user entity. */
@Entity(name = "`User`")
public class User {
  @JsonIgnore
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  private String userName;

  // should icons in the radar be shown?
  @Column(name = "icon_display")
  private Boolean showIcons;

  // should icons in the radar be shown in color? (false = black/white)
  @Column(name = "colour_display")
  private Boolean showIconsInColor;

  @Column(name = "theme_preference")
  @Enumerated(EnumType.STRING)
  private ThemeId themePreference;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "role")
  @Enumerated(EnumType.STRING)
  private List<RoleName> roles = new ArrayList<>();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  /**
   * Returns the list of roles of the user, if the list is empty adds Role USER.
   *
   * @return list of roles.
   */
  public List<RoleName> getRoles() {
    if (roles.isEmpty()) {
      roles.add(RoleName.USER);
    }
    return roles;
  }

  public void addRole(RoleName userRole) {
    this.roles.add(userRole);
  }

  public void setAllRoles(List<RoleName> userRole) {
    this.roles = new ArrayList<>();
    this.roles.addAll(userRole);
  }

  public boolean hasRole(RoleName role) {
    return this.roles.contains(role);
  }

  /** Returns radar display setting "showIconsInColor" (fallback = false). */
  public boolean getShowIconsInColor() {
    if (showIconsInColor == null) {
      return false;
    }
    return showIconsInColor;
  }

  /** Returns radar display setting "showIcons" (fallback = true). */
  public boolean getShowIcons() {
    if (showIcons == null) {
      return false;
    }
    return showIcons;
  }

  /** Updates settings based on settingsDto. */
  public void updateSettings(UserSettingsDto settingsDto) {
    if (settingsDto.getShowIconsInColor() == null) settingsDto.setShowIconsInColor(false);
    if (settingsDto.getShowIcons() == null) settingsDto.setShowIcons(true);
    updateUserDisplay(settingsDto.getShowIconsInColor(), settingsDto.getShowIcons());
  }

  /** Returns the user's settings as UserSettingsDto. */
  public UserSettingsDto getUserSettingsDto() {
    UserSettingsDto dto = new UserSettingsDto();
    dto.setShowIconsInColor(this.showIconsInColor);
    dto.setShowIcons(this.showIcons);
    return dto;
  }

  /** Updates the user's radar display settings. */
  public void updateUserDisplay(boolean showIconsInColor, boolean showIcons) {
    this.showIconsInColor = showIconsInColor;
    this.showIcons = showIcons;
  }

  /**
   * Return the theme preference, if null return "light".
   *
   * @return theme preference.
   */
  public ThemeId getThemePreference() {
    if (themePreference == null) {
      return themePreference.LIGHT;
    }
    return themePreference;
  }

  /**
   * Set the theme preference.
   *
   * @param themePreference the theme preference to set.
   */
  public void setThemePreference(ThemeId themePreference) {
    this.themePreference = themePreference;
  }
}

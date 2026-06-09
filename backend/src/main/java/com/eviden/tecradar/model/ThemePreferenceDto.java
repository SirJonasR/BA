package com.eviden.tecradar.model;

import jakarta.validation.constraints.NotNull;

/** DTO for user theme preference. */
public class ThemePreferenceDto {
  @NotNull(message = "Theme preference cannot be null")
  private ThemeId themePreference;

  /** Default constructor for ThemePreferenceDto. */
  public ThemePreferenceDto() {}

  /**
   * Constructor for ThemePreferenceDto.
   *
   * @param themePreference The theme preference value.
   */
  public ThemePreferenceDto(ThemeId themePreference) {
    this.themePreference = themePreference;
  }

  /**
   * Get the theme preference.
   *
   * @return The theme preference.
   */
  public ThemeId getThemePreference() {
    return themePreference;
  }

  /**
   * Set the theme preference.
   *
   * @param themePreference The theme preference to set.
   */
  public void setThemePreference(ThemeId themePreference) {
    this.themePreference = themePreference;
  }
}

package com.eviden.tecradar.model;

import com.fasterxml.jackson.annotation.JsonProperty;

/** Enum for valid theme identifiers used in API payloads. */
public enum ThemeId {
  @JsonProperty("light")
  LIGHT,
  @JsonProperty("dark")
  DARK,
  @JsonProperty("night-sky")
  NIGHT_SKY,
  @JsonProperty("atos-light")
  ATOS_LIGHT,
}

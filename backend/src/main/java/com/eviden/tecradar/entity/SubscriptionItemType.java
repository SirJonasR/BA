package com.eviden.tecradar.entity;

/** Enum to identify what Element the SubscriptionItem is subscribed to. */
public enum SubscriptionItemType {
  CATEGORY("CATEGORY"),
  LIFECYCLE("LIFECYCLE"),
  TECHNOLOGY("TECHNOLOGY"),
  RADAR("RADAR");
  String value;

  private SubscriptionItemType(String value) {
    this.value = value;
  }

  public String getValue() {
    return value;
  }
}

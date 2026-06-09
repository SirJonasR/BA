package com.eviden.tecradar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Embedded Certificate for history_certificate. */
@Embeddable
public class EmbeddedCertificate {
  public String name;

  @Column(length = 1800)
  public String description;

  @Column(length = 1800, name = "follow_ups")
  public String followUps;

  @Column(length = 1800, name = "prerequisites")
  public String pres;
}

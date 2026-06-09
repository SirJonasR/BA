package com.eviden.tecradar.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.time.LocalDate;

/** Embedded Project for history_project. */
@Embeddable
public class EmbeddedProject {
  public String name;

  @Column(length = 1800)
  public String description;

  @Column(length = 1800)
  public String info;

  @Column(name = "contact_person")
  public String contactPerson;

  @Column(name = "start_date")
  public LocalDate startDate;

  @Column(length = 1800)
  public String customers;
}

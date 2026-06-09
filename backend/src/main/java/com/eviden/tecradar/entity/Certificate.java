package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.hibernate.annotations.Cascade;
import org.hibernate.annotations.CascadeType;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/** Entity for Certificate. */
@Entity
public class Certificate {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @Column(length = 60)
  private String name;

  @Column(length = 1800)
  private String description;

  @ManyToOne
  @JsonIgnore
  @OnDelete(action = OnDeleteAction.CASCADE)
  private Technology technology;

  @ManyToMany
  @JsonIgnore
  @JoinTable(
      name = "certificate_prerequisite",
      joinColumns = @JoinColumn(name = "certificate_id"),
      inverseJoinColumns = @JoinColumn(name = "prerequisite_id"))
  @Cascade(CascadeType.ALL)
  private List<Certificate> prerequisites;

  @ManyToMany
  @JsonIgnore
  @JoinTable(
      name = "certificate_follow_up",
      joinColumns = @JoinColumn(name = "certificate_id"),
      inverseJoinColumns = @JoinColumn(name = "follow_up_id"))
  @Cascade(CascadeType.ALL)
  private List<Certificate> followUps;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Technology getTechnology() {
    return technology;
  }

  public void setTechnology(Technology technology) {
    this.technology = technology;
  }

  /**
   * Return list of prerequisites certificates, if not null otherwise empty list.
   *
   * @return list of prerequisites certificates.
   */
  public List<Certificate> getPrerequisites() {
    if (prerequisites == null || prerequisites.isEmpty()) {
      return new ArrayList<>();
    }
    return prerequisites;
  }

  public void setPrerequisites(List<Certificate> prerequisites) {
    this.prerequisites = prerequisites;
  }

  /**
   * Return ids of the prerequisites, if not null otherwise empty list.
   *
   * @return list of prerequisites ids.
   */
  @JsonProperty("prerequisites")
  public List<Long> getPrerequisiteIds() {
    if (prerequisites == null || prerequisites.isEmpty()) {
      return new ArrayList<>();
    }
    return prerequisites.stream().map(Certificate::getId).collect(Collectors.toList());
  }

  /**
   * Return ids of the follow-ups, if not null otherwise empty list.
   *
   * @return list of follow-ups ids.
   */
  @JsonProperty("followUps")
  public List<Long> getFollowUpIds() {
    if (followUps == null || followUps.isEmpty()) {
      return new ArrayList<>();
    }
    return followUps.stream().map(Certificate::getId).collect(Collectors.toList());
  }

  /**
   * Return follow-up certificates, if not null otherwise empty list.
   *
   * @return list of follow-up certificates.
   */
  public List<Certificate> getFollowUps() {
    if (followUps == null || followUps.isEmpty()) {
      return new ArrayList<>();
    }
    return followUps;
  }

  public void setFollowUps(List<Certificate> followUps) {
    this.followUps = followUps;
  }
}

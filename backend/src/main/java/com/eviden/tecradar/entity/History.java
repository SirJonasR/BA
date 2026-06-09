package com.eviden.tecradar.entity;

import com.eviden.tecradar.model.EmbeddedCertificate;
import com.eviden.tecradar.model.EmbeddedProject;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.SequenceGenerator;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;

/** entity for history. */
@Entity
public class History {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  @CreationTimestamp private LocalDateTime changeDate;
  @JsonIgnore @ManyToOne private User user;
  @JsonIgnore @ManyToOne private Technology technology;
  private String name;

  @Column(length = 1800)
  private String description;

  @Column(length = 300, name = "short_description")
  private String shortDescription;

  @Column(name = "picture_id")
  private Long pictureId;

  @Column(name = "priority")
  private Boolean priority;

  @JsonIgnore @ManyToOne private Category category;
  @JsonIgnore @ManyToOne private Lifecycle lifecycle;

  @ElementCollection
  @CollectionTable(name = "history_tag", joinColumns = @JoinColumn(name = "history_id"))
  @Column(name = "tag")
  private List<String> tags;

  @ElementCollection
  @CollectionTable(
      name = "history_embedded_project",
      joinColumns = @JoinColumn(name = "history_id"))
  private List<EmbeddedProject> projects;

  @ElementCollection
  @CollectionTable(
      name = "history_embedded_certificate",
      joinColumns = @JoinColumn(name = "history_id"))
  private List<EmbeddedCertificate> certificates;

  @ElementCollection
  @CollectionTable(
      name = "history_connected_technology_name",
      joinColumns = @JoinColumn(name = "history_id"))
  @Column(name = "technology_name")
  private List<String> connectedTechnologyNames;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public LocalDateTime getDate() {
    return changeDate;
  }

  // Necessary for Testing Purposes
  public void setDate(LocalDateTime ldt) {
    this.changeDate = ldt;
  }

  public void setDate() {
    this.changeDate = LocalDateTime.now();
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getUsername() {
    return user.getUserName();
  }

  public Technology getTechnology() {
    return technology;
  }

  public void setTechnology(Technology technology) {
    this.technology = technology;
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

  public String getShortDescription() {
    return shortDescription;
  }

  public void setShortDescription(String shortDescription) {
    this.shortDescription = shortDescription;
  }

  public Category getCategory() {
    return category;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public Lifecycle getLifecycle() {
    return lifecycle;
  }

  public void setLifecycle(Lifecycle lifecycle) {
    this.lifecycle = lifecycle;
  }

  public String getCategoryName() {
    return category.getName();
  }

  public String getLifecycleName() {
    return lifecycle.getName();
  }

  public Long getPictureId() {
    return pictureId;
  }

  public void setPictureId(Long pictureId) {
    this.pictureId = pictureId;
  }

  public boolean isPriority() {
    return priority != null ? priority : false;
  }

  public void setPriority(boolean priority) {
    this.priority = priority;
  }

  public List<String> getTags() {
    return tags;
  }

  public void setTags(List<String> tags) {
    this.tags = tags;
  }

  public List<EmbeddedCertificate> getCertificates() {
    return certificates;
  }

  public void setCertificates(List<EmbeddedCertificate> certificates) {
    this.certificates = certificates;
  }

  public List<String> getConnectedTechnologyNames() {
    return connectedTechnologyNames;
  }

  public void setConnectedTechnologyNames(List<String> connectedTechnologyNames) {
    this.connectedTechnologyNames = connectedTechnologyNames;
  }

  public List<EmbeddedProject> getProjects() {
    return projects;
  }

  public void setProjects(List<EmbeddedProject> projects) {
    this.projects = projects;
  }
}

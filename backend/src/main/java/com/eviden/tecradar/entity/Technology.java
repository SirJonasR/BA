package com.eviden.tecradar.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/** The technology entity. */
@Entity
public class Technology {

  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hibernate_sequence")
  @SequenceGenerator(
      name = "hibernate_sequence",
      sequenceName = "hibernate_sequence",
      allocationSize = 1)
  private Long id;

  private String name;

  @Column(length = 1800)
  private String description;

  @Column(length = 300, name = "short_description")
  private String shortDescription;

  @ManyToMany(fetch = FetchType.LAZY)
  private List<Tag> tags;

  @Column(name = "picture_id")
  private Long pictureId;

  @JsonIgnore @ManyToOne private Category category;
  @JsonIgnore @ManyToOne private Lifecycle lifecycle;

  @Column(name = "jump_date")
  private LocalDateTime jumpDate;

  private int status;

  @Column(name = "priority")
  private Boolean priority;

  @Column(name = "view_count")
  private Long viewCount;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(
      name = "technology_connected_technologies",
      joinColumns = @JoinColumn(name = "technology_id"))
  @Column(name = "connected_technology_id")
  private List<Long> connectedTechnologyIds = new ArrayList<>();

  @Transient private List<String> connectedTechnologyNames = new ArrayList<>();

  //  @OneToMany(mappedBy = "technology", fetch = FetchType.EAGER)
  //  private List<CustomerProjectTechnology> customerProjectTechnologies;

  @OneToMany(mappedBy = "technology", fetch = FetchType.EAGER)
  private List<Certificate> certificates;

  @ManyToMany(mappedBy = "technologies", fetch = FetchType.EAGER)
  private List<Project> projects;

  /**
   * return view count if not null, otherwise 0.
   *
   * @return view count
   */
  public Long getViewCount() {
    if (this.viewCount == null) {
      setViewCount(0L);
    }
    return viewCount;
  }

  public void setViewCount(Long viewCount) {
    this.viewCount = viewCount;
  }

  /**
   * gets status of the technology. If jump date is 28 days ago, return status 4.
   *
   * @return status of the technology.
   */
  public int getStatus() {
    LocalDateTime currentDate = LocalDateTime.now();
    long daysDifference = ChronoUnit.DAYS.between(jumpDate, currentDate);
    if (daysDifference >= 28) {
      status = 4;
    }
    return status;
  }

  public void setStatus(int status) {
    this.status = status;
  }

  /**
   * Gets jump date of the technology. If jump date is null, jump date becomes current date.
   *
   * @return the jump date of the technology
   */
  public LocalDateTime getJumpDate() {
    if (jumpDate == null) {
      jumpDate = LocalDateTime.now();
    }
    return jumpDate;
  }

  public void setJumpDate(LocalDateTime date) {
    this.jumpDate = date;
  }

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

  public String getShortDescription() {
    return shortDescription;
  }

  public void setShortDescription(String shortDescription) {
    this.shortDescription = shortDescription;
  }

  public Long getPictureId() {
    return pictureId;
  }

  public void setPictureId(Long pictureId) {
    this.pictureId = pictureId;
  }

  public Category getCategory() {
    return category;
  }

  public void setCategory(Category category) {
    this.category = category;
  }

  public Long getCategoryId() {
    return category.getId();
  }

  public Lifecycle getLifecycle() {
    return lifecycle;
  }

  public void setLifecycle(Lifecycle lifecycle) {
    this.lifecycle = lifecycle;
  }

  public Long getLifecycleId() {
    return lifecycle.getId();
  }

  /**
   * Get the tags of this technology as a list of strings. If there are less than 5 tags, add empty
   * strings until there are 5.
   *
   * @return list of tag names
   */
  public List<String> getTags() {
    List<String> tagNames = new ArrayList<>();
    if (tags != null) {
      for (Tag tag : tags) {
        tagNames.add(tag.getName());
      }
    }
    Collections.sort(tagNames);
    return tagNames;
  }

  public void setTags(List<Tag> tags) {
    Set<Tag> uniqueTags = new LinkedHashSet<>(tags);
    this.tags = new ArrayList<>(uniqueTags);
  }

  @JsonIgnore
  public List<Tag> getTagObjects() {
    return this.tags;
  }

  public void addTag(Tag tag) {
    this.tags.add(tag);
  }

  public void removeTag(Tag tag) {
    this.tags.remove(tag);
  }

  public List<Long> getConnectedTechnologyIds() {
    return this.connectedTechnologyIds;
  }

  public void setConnectedTechnologyIds(List<Long> connectedTechnologyIds) {
    this.connectedTechnologyIds = connectedTechnologyIds;
  }

  public List<String> getConnectedTechnologyNames() {
    return this.connectedTechnologyNames;
  }

  public void setConnectedTechnologyNames(List<String> connectedTechnologyNames) {
    this.connectedTechnologyNames = connectedTechnologyNames;
  }

  /**
   * Return certificates, if not null otherwise empty list.
   *
   * @return list of certificates.
   */
  public List<Certificate> getCertificates() {
    if (certificates == null) {
      return new ArrayList<>();
    }
    return certificates;
  }

  public void setCertificates(List<Certificate> certificates) {
    this.certificates = certificates;
  }

  public boolean isPriority() {
    return priority != null ? priority : false;
  }

  public void setPriority(boolean priority) {
    this.priority = priority;
  }

  /**
   * Retrieves this list of projects, which are this technology is used.
   *
   * @return retrieves a list of projects
   */
  public List<Project> getProjects() {
    if (projects != null) {
      projects.sort(Comparator.comparing(Project::getName));
      return projects;
    } else {
      return new ArrayList<>();
    }
  }

  public void setProjects(List<Project> projects) {
    this.projects = projects;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Technology technology = (Technology) o;
    return Objects.equals(id, technology.id);
  }

  @Override
  public int hashCode() {
    return Objects.hashCode(id);
  }
}

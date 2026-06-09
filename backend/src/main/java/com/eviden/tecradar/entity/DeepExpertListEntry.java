package com.eviden.tecradar.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity(name = "deep_expert_list")
public class DeepExpertListEntry {

  @Column(name = "list_index")
  @Id
  private int listIndex;

  @Column(length = 400, nullable = false, name = "technology_name")
  private String technologyName;

  @Column(length = 400, name = "expert_information")
  private String expertInformation;

  @Column(length = 1500)
  private String scope;

  @Column(length = 1500)
  private String comment;

  @Column(length = 1500)
  private String description;

  public int getListIndex() {
    return listIndex;
  }

  public void setListIndex(int listIndex) {
    this.listIndex = listIndex;
  }

  public String getTechnologyName() {
    return technologyName;
  }

  public void setTechnologyName(String technologyName) {
    this.technologyName = technologyName;
  }

  public String getExpertInformation() {
    return expertInformation;
  }

  public void setExpertInformation(String expertInformation) {
    this.expertInformation = expertInformation;
  }

  public String getScope() {
    return scope;
  }

  public void setScope(String scope) {
    this.scope = scope;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
}

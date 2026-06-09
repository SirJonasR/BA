package com.eviden.tecradar.resource;

import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.core.MediaType;
import java.util.Arrays;
import java.util.List;
import org.jboss.resteasy.reactive.PartType;

/** Data container for transferring technology related data from client to backend. */
public class TechnologyRequestForm {
  @FormParam("name")
  @PartType(MediaType.TEXT_PLAIN)
  private String name;

  @FormParam("description")
  @PartType(MediaType.TEXT_PLAIN)
  private String description;

  @FormParam("shortDescription")
  @PartType(MediaType.TEXT_PLAIN)
  private String shortDescription;

  @FormParam("categoryId")
  @PartType(MediaType.TEXT_PLAIN)
  private Long categoryId;

  @FormParam("lifecycleId")
  @PartType(MediaType.TEXT_PLAIN)
  private Long lifecycleId;

  @FormParam("pictureData")
  @PartType(MediaType.APPLICATION_OCTET_STREAM)
  private byte[] pictureData;

  @FormParam("isNewPic")
  @PartType(MediaType.TEXT_PLAIN)
  private boolean isNewPic;

  @FormParam("tags")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> tags;

  @FormParam("connectedTechnologyIds")
  @PartType(MediaType.TEXT_PLAIN)
  private List<Long> connectedTechnologyIds;

  @FormParam("projectIds")
  @PartType(MediaType.TEXT_PLAIN)
  private List<Long> projectIds;

  @FormParam("certificateNames")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> certificateNames;

  @FormParam("certificateDescriptions")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> certificateDescriptions;

  @FormParam("certificatePrerequisites")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> certificatePrerequisites;

  @FormParam("certificateFollowUps")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> certificateFollowUps;

  @FormParam("projectDescriptions")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> projectDescriptions;

  @FormParam("projectContactPeople")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> projectContactPeople;

  @FormParam("projectInfos")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> projectInfos;

  @FormParam("projectStartDates")
  @PartType(MediaType.TEXT_PLAIN)
  private List<String> projectStartDates;

  @FormParam("priority")
  @PartType(MediaType.TEXT_PLAIN)
  private boolean priority;

  public String getName() {
    return name.strip();
  }

  public void setName(String name) {
    this.name = name.strip();
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

  public Long getCategoryId() {
    return categoryId;
  }

  public void setCategoryId(Long categoryId) {
    this.categoryId = categoryId;
  }

  public Long getLifecycleId() {
    return lifecycleId;
  }

  public void setLifecycleId(Long lifecycleId) {
    this.lifecycleId = lifecycleId;
  }

  public byte[] getPictureData() {
    return pictureData;
  }

  public void setPictureData(byte[] pictureData) {
    this.pictureData = pictureData;
  }

  public boolean isNewPic() {
    return isNewPic;
  }

  public void setIsNewPic(boolean newPic) {
    this.isNewPic = newPic;
  }

  public List<String> getTags() {
    return this.tags;
  }

  public void setTags(List<String> tags) {
    this.tags = tags;
  }

  public List<Long> getConnectedTechnologyIds() {
    return connectedTechnologyIds;
  }

  public void setConnectedTechnologyIds(List<Long> connectedTechnologyIds) {
    this.connectedTechnologyIds = connectedTechnologyIds;
  }

  public List<String> getCertificationNames() {
    return certificateNames;
  }

  public void setCertificationNames(List<String> certificateNames) {
    this.certificateNames = certificateNames;
  }

  public List<String> getCertificationDescription() {
    return certificateDescriptions;
  }

  public void setCertificationDescription(List<String> certificateDescriptions) {
    this.certificateDescriptions = certificateDescriptions;
  }

  public List<String> getCertificatePrerequisites() {
    return certificatePrerequisites;
  }

  public void setCertificatePrerequisites(List<String> certificatePrerequisites) {
    this.certificatePrerequisites = certificatePrerequisites;
  }

  public List<String> getCertificateFollowUps() {
    return certificateFollowUps;
  }

  public void setCertificateFollowUps(List<String> certificateFollowUps) {
    this.certificateFollowUps = certificateFollowUps;
  }

  public boolean isPriority() {
    return priority;
  }

  public void setPriority(boolean priority) {
    this.priority = priority;
  }

  public List<Long> getProjectIds() {
    return this.projectIds;
  }

  public void setProjectIds(List<Long> projectIds) {
    this.projectIds = projectIds;
  }

  @Override
  public String toString() {
    return "TechnologyRequestForm{"
        + "name='"
        + name
        + '\''
        + ", description='"
        + description
        + '\''
        + ", shortDescription='"
        + shortDescription
        + '\''
        + ", categoryId="
        + categoryId
        + ", lifecycleId="
        + lifecycleId
        + ", pictureData="
        + Arrays.toString(pictureData)
        + ", isNewPic="
        + isNewPic
        + ", tags="
        + tags
        + ", connectedTechnologyIds="
        + connectedTechnologyIds
        + ", projectIds="
        + projectIds
        + ", certificateNames="
        + certificateNames
        + ", certificateDescription="
        + certificateDescriptions
        + ", certificatePrerequisites"
        + certificatePrerequisites
        + ", certificateFollowUps"
        + certificateFollowUps
        + ", priority="
        + priority
        + '}';
  }
}

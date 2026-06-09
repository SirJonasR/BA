package com.eviden.tecradar.model;

import com.eviden.tecradar.entity.Certificate;
import com.eviden.tecradar.entity.Technology;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/** Data Transfer Object (DTO) for Technology with simplified project references. */
public class TechnologyDto {
  public Long id;
  public String name;
  public String description;
  public String shortDescription;
  public List<String> tags;
  public Long pictureId;
  public Long categoryId;
  public Long lifecycleId;
  public LocalDateTime jumpDate;
  public int status;
  public boolean priority;
  public Long viewCount;
  public List<Long> connectedTechnologyIds;
  public List<String> connectedTechnologyNames;
  public List<Certificate> certificates;
  public List<ProjectReferenceDto> projects;

  public TechnologyDto() {}

  /**
   * Creates a TechnologyDto from a Technology entity.
   *
   * @param technology the technology entity
   * @return the technology DTO
   */
  public static TechnologyDto fromEntity(Technology technology) {
    if (technology == null) {
      return null;
    }

    TechnologyDto dto = new TechnologyDto();
    dto.id = technology.getId();
    dto.name = technology.getName();
    dto.description = technology.getDescription();
    dto.shortDescription = technology.getShortDescription();
    dto.tags = technology.getTags();
    dto.pictureId = technology.getPictureId();
    dto.categoryId = technology.getCategoryId();
    dto.lifecycleId = technology.getLifecycleId();
    dto.jumpDate = technology.getJumpDate();
    dto.status = technology.getStatus();
    dto.priority = technology.isPriority();
    dto.viewCount = technology.getViewCount();
    dto.connectedTechnologyIds = technology.getConnectedTechnologyIds();
    dto.connectedTechnologyNames = technology.getConnectedTechnologyNames();
    dto.certificates = technology.getCertificates();
    dto.projects =
        technology.getProjects().stream()
            .map(ProjectReferenceDto::fromEntity)
            .collect(Collectors.toList());

    return dto;
  }
}

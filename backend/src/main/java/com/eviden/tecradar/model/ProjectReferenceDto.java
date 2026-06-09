package com.eviden.tecradar.model;

import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.entity.Project;
import java.util.List;

/** Data Transfer Object (DTO) representing a project reference with minimal information. */
public class ProjectReferenceDto {
  public Long id;
  public String name;
  public List<Customer> customers;

  public ProjectReferenceDto() {}

  public ProjectReferenceDto(Long id, String name, List<Customer> customers) {
    this.id = id;
    this.name = name;
    this.customers = customers;
  }

  /**
   * Creates a ProjectReferenceDto from a Project entity.
   *
   * @param project the project entity
   * @return the project reference DTO
   */
  public static ProjectReferenceDto fromEntity(Project project) {
    if (project == null) {
      return null;
    }
    return new ProjectReferenceDto(project.getId(), project.getName(), project.getCustomers());
  }
}

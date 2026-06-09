package com.eviden.tecradar.model;

import com.eviden.tecradar.entity.Customer;
import java.util.List;

/** Data Transfer Object (DTO) representing a project. */
public class ProjectDto {
  public long id;
  public String name;
  public String industry;
  public String description;
  public List<ContactDto> contact;
  public String salesServiceLink;
  public String info;
  public String industrySpecificInformation;
  public String startDate;
  public String endDate;
  public List<Customer> customers;
  public List<Long> technologyIds;
}

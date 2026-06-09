package com.eviden.tecradar.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UpdateDeepExpertListEntryDto {
  @Min(0)
  public int tableRow;

  @NotBlank
  @Size(max = 400)
  public String technologyName;

  @Size(max = 400)
  public String expertInformation;

  @Size(max = 1500)
  public String scope;

  @Size(max = 1500)
  public String comment;

  @Size(max = 1500)
  public String description;
}

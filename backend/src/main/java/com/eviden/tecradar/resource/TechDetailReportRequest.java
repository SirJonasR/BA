package com.eviden.tecradar.resource;

import java.util.Date;

/** Data container for transferring technology report request details from client to backend. */
public class TechDetailReportRequest {

  private Long[] technologyIds;
  private Date startDate;
  private Date endDate;

  public Long[] getTechnologyIds() {
    return technologyIds;
  }

  public void setTechnologyIds(Long[] technologyIds) {
    this.technologyIds = technologyIds;
  }

  public Date getStartDate() {
    return startDate;
  }

  public void setStartDate(Date startDate) {
    this.startDate = startDate;
  }

  public Date getEndDate() {
    return endDate;
  }

  public void setEndDate(Date endDate) {
    this.endDate = endDate;
  }
}

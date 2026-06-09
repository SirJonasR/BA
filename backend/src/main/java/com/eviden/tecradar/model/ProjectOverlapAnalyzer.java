package com.eviden.tecradar.model;

import com.eviden.tecradar.entity.Technology;
import java.util.List;

/**
 * Class of ProjectOverlapAnalyzer. Object which contains the project name, used technologies, the
 * technologies, which should be checked for overlaps, the list of technologies which are
 * overlapping, and how much is the overlap in percent.
 */
public class ProjectOverlapAnalyzer {
  private String projectName;
  private String industryName;
  private List<Technology> allTechnologiesFromProject;
  private List<Technology> givenTechnologies;
  private List<Technology> overlappedTechnologies;

  public String getProjectName() {
    return projectName;
  }

  public void setProjectName(String projectName) {
    this.projectName = projectName;
  }

  public String getIndustryName() {
    return industryName;
  }

  public void setIndustryName(String industryName) {
    this.industryName = industryName;
  }

  public List<Technology> getAllTechnologiesFromProject() {
    return allTechnologiesFromProject;
  }

  public void setAllTechnologiesFromProject(List<Technology> allTechnologiesFromProject) {
    this.allTechnologiesFromProject = allTechnologiesFromProject;
  }

  public List<Technology> getGivenTechnologies() {
    return givenTechnologies;
  }

  public void setGivenTechnologies(List<Technology> givenTechnologies) {
    this.givenTechnologies = givenTechnologies;
  }

  public List<Technology> getOverlappedTechnologies() {
    return overlappedTechnologies;
  }

  public void setOverlappedTechnologies(List<Technology> overlappedTechnologies) {
    this.overlappedTechnologies = overlappedTechnologies;
  }

  public double getOverlappedPercent() {
    return (double) overlappedTechnologies.size() / givenTechnologies.size();
  }
}

package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.TooManyTechnologiesSelectedException;
import com.eviden.tecradar.model.ProjectOverlapAnalyzer;
import com.eviden.tecradar.repository.TechnologyRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Class for calculating similarities between technologies. */
@ApplicationScoped
public class SimilarityService {

  public static final int MAX_TECH_NUMBER = 50;
  @Inject TechnologyRepository technologyRepository;
  @Inject TechnologyService technologyService;
  @Inject ProjectService projectService;

  /**
   * Calculate similarities between the input technology and all other technologies based on tags.
   *
   * @param id The id of the technology to compare.
   * @return A map where keys are technology names and values are similarity scores.
   */
  public Map<String, long[]> calculateTagSimilarity(Long id) {
    Technology targetTech = technologyService.get(id);

    if (targetTech == null) {
      return null;
    }

    List<Technology> allTechnologies = technologyRepository.listAll();
    Map<String, long[]> similarityScores = new HashMap<>();

    List<String> targetTags = targetTech.getTags();

    for (Technology tech : allTechnologies) {
      if (!tech.getId().equals(targetTech.getId())) {
        double similarity = calculateJaccardSimilarity(targetTags, tech.getTags());
        similarity = Math.round(similarity * 100.0);
        if (similarity == 0) {
          continue;
        }

        if (!targetTech.getCategory().equals(tech.getCategory())) {
          similarity *= (double) 2 / (double) 3;
        }

        long[] similarityArray = {(int) similarity, tech.getId()};
        similarityScores.put(tech.getName(), similarityArray);
      }
    }

    return similarityScores.entrySet().stream()
        .sorted(
            Map.Entry.<String, long[]>comparingByValue(Comparator.comparingLong(arr -> arr[0]))
                .reversed())
        .limit(5)
        .collect(
            Collectors.toMap(
                Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1, LinkedHashMap::new));
  }

  /**
   * Calculate Jaccard similarity between two sets of tags.
   *
   * @param tags1i The first set of tags.
   * @param tags2i The second set of tags.
   * @return The Jaccard similarity score.
   */
  public double calculateJaccardSimilarity(List<String> tags1i, List<String> tags2i) {
    List<String> tags1 = new ArrayList<>(tags1i);
    List<String> tags2 = new ArrayList<>(tags2i);
    int intersection = 0;

    if (tags1.isEmpty() || tags2.isEmpty()) {
      return 0;
    }

    tags1.removeIf(String::isEmpty);
    tags2.removeIf(String::isEmpty);

    int union = tags1.size() + tags2.size();

    if (union == 0) {
      return 0;
    }

    for (String tag : tags1) {
      if (tags2.contains(tag)) {
        intersection++;
        union--;
      }
    }

    return (double) intersection / (double) union;
  }

  /**
   * Analyzes the overlap between a given list of technology IDs and the technologies associated
   * with projects in the system. Returns a list of {@link ProjectOverlapAnalyzer} objects, which
   * provide detailed information about the overlap for each relevant project.
   *
   * @param technologyIds a list of technology IDs to compare against the technologies in the
   *     projects
   * @return a list of {@link ProjectOverlapAnalyzer} objects containing: - the project name, - all
   *     technologies associated with the project, - the given technologies, - and the subset of
   *     technologies that overlap between the project and the input list.
   */
  public List<ProjectOverlapAnalyzer> getOverLappedProjects(
      List<Long> technologyIds, List<Long> industryIds) {
    if (technologyIds.size() > MAX_TECH_NUMBER) {
      throw new TooManyTechnologiesSelectedException(
          "Too many technologies selected (max:" + MAX_TECH_NUMBER + "technologies)");
    }
    List<Project> projects = projectService.getAll();
    List<Technology> givenTechnologies =
        technologyIds.stream().map(technologyService::get).collect(Collectors.toList());
    return projects.stream()
        .filter(project -> project.getTechnologyIds().stream().anyMatch(technologyIds::contains))
        .filter(
            project ->
                industryIds.isEmpty()
                    || (project.getIndustry() != null
                        && industryIds.contains(project.getIndustry().getId())))
        .map(
            project -> {
              ProjectOverlapAnalyzer analyzer = new ProjectOverlapAnalyzer();
              analyzer.setProjectName(project.getName());
              analyzer.setIndustryName(project.getIndustryName());
              analyzer.setAllTechnologiesFromProject(project.getTechnologies());
              analyzer.setGivenTechnologies(givenTechnologies);

              List<Technology> overlappedTechnologies =
                  project.getTechnologyIds().stream()
                      .filter(technologyIds::contains)
                      .map(technologyService::get)
                      .collect(Collectors.toList());
              analyzer.setOverlappedTechnologies(overlappedTechnologies);
              return analyzer;
            })
        .collect(Collectors.toList());
  }
}

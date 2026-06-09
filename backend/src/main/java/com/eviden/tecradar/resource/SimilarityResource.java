package com.eviden.tecradar.resource;

import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.exception.TooManyTechnologiesSelectedException;
import com.eviden.tecradar.model.ProjectOverlapAnalyzer;
import com.eviden.tecradar.service.SimilarityService;
import jakarta.inject.Inject;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** Resource for calculating similarities between technologies. */
@Path("/similarity")
@Produces(MediaType.APPLICATION_JSON)
public class SimilarityResource {

  @Inject SimilarityService similarityService;

  /**
   * Retrieves the similarity scores for a given technology based on tags.
   *
   * @param id The id of the technology.
   * @return A map where keys are technology names and values are similarity scores.
   * @throws NotFoundException if the technology does not exist.
   */
  @GET
  @Path("{technologyId}")
  public Map<String, Long> getTagSimilarity(@PathParam("technologyId") Long id) {
    try {
      Map<String, long[]> similarityScores = similarityService.calculateTagSimilarity(id);

      Map<String, Long> filteredSimilarityScores = new TreeMap<>();
      for (Map.Entry<String, long[]> entry : similarityScores.entrySet()) {
        long[] scores = entry.getValue();
        filteredSimilarityScores.put(entry.getKey(), scores[1]);
      }
      return filteredSimilarityScores;
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Technology with Id " + id + " not found.");
    }
  }

  /**
   * Return a list of project overlaps for a given list of technology ids.
   *
   * @param technologyIds list of technology ids.
   * @return a list of projectOverlapAnalyzer.
   */
  @GET
  @Path("project-overlap")
  public List<ProjectOverlapAnalyzer> getProjectOverlapAnalyzers(
      @QueryParam("technologyIds") List<Long> technologyIds,
      @QueryParam("industryIds") List<Long> industryIds) {
    try {
      return similarityService.getOverLappedProjects(technologyIds, industryIds);
    } catch (TooManyTechnologiesSelectedException ex) {
      throw new BadRequestException(ex.getMessage());
    }
  }
}

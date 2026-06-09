package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.entity.Tag;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.TooManyTechnologiesSelectedException;
import com.eviden.tecradar.repository.TechnologyRepository;
import io.quarkus.test.junit.QuarkusTest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.LongStream;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

@QuarkusTest
public class SimilarityServiceTest {

  @Mock private TechnologyRepository technologyRepository;
  @Mock private TechnologyService technologyService;
  @Mock private ProjectService projectService;

  private SimilarityService similarityService;

  @BeforeEach
  public void setUp() {
    MockitoAnnotations.initMocks(this);
    similarityService = new SimilarityService();
    similarityService.technologyRepository = technologyRepository;
    similarityService.technologyService = technologyService;
    similarityService.projectService = projectService;
  }

  /** Test Calculate Tag Similarity */
  @Test
  public void testCalculateTagSimilarity_Success() {
    // Arrange
    Tag tag1 = new Tag();
    tag1.setName("Java");
    Tag tag2 = new Tag();
    tag2.setName("Spring");
    Tag tag3 = new Tag();
    tag3.setName("Hibernate");

    Category category1 = new Category();
    category1.setId(1L);

    Long targetTechId = 1L;
    Technology targetTech = new Technology();
    targetTech.setId(targetTechId);
    targetTech.setName("TargetTech");
    targetTech.setCategory(category1);
    List<Tag> targetTags = new ArrayList<>();
    targetTags.add(tag1);
    targetTags.add(tag2);
    targetTech.setTags(targetTags);

    when(technologyService.get(targetTechId)).thenReturn(targetTech);

    Technology tech1 = new Technology();
    tech1.setId(2L);
    tech1.setName("Tech1");
    tech1.setCategory(category1);
    List<Tag> tech1Tags = new ArrayList<>();
    tech1Tags.add(tag1);
    tech1Tags.add(tag3);
    tech1.setTags(tech1Tags);

    Technology tech2 = new Technology();
    tech2.setId(3L);
    tech2.setName("Tech2");
    tech2.setCategory(category1);
    List<Tag> tech2Tags = new ArrayList<>();
    tech2Tags.add(tag1);
    tech2Tags.add(tag2);
    tech2Tags.add(tag3);
    tech2.setTags(tech2Tags);

    List<Technology> allTechnologies = new ArrayList<>();
    allTechnologies.add(targetTech);
    allTechnologies.add(tech1);
    allTechnologies.add(tech2);

    when(technologyRepository.listAll()).thenReturn(allTechnologies);

    // Act
    Map<String, long[]> similarityScores = similarityService.calculateTagSimilarity(targetTechId);

    // Assert
    assertNotNull(similarityScores);
    assertEquals(2, similarityScores.size());
    assertTrue(similarityScores.containsKey("Tech1"));
    assertTrue(similarityScores.containsKey("Tech2"));
  }

  /** Test Calculate Tag Similarity when Tech is not Found */
  @Test
  public void testCalculateTagSimilarity_TargetTechNotFound() {
    // Arrange
    Long targetTechId = 1L;

    when(technologyService.get(targetTechId)).thenReturn(null);

    // Act
    Map<String, long[]> similarityScores = similarityService.calculateTagSimilarity(targetTechId);

    // Assert
    assertNull(similarityScores);
  }

  @Test
  void testJaccardSimilarity() {

    // private double calculateJaccardSimilarity(List<Strinsg> tags1, List<String> tags2) {

    List<String> tags1 = new ArrayList<>();
    List<String> tags2 = new ArrayList<>();

    double JaccardSimilarity =
        similarityService.calculateJaccardSimilarity(
            List.of(new String[] {}), List.of(new String[] {}));
    Assertions.assertEquals(0.0, JaccardSimilarity);

    tags1.add("");
    tags2.add("");

    JaccardSimilarity = similarityService.calculateJaccardSimilarity(tags1, tags2);
    Assertions.assertEquals(0.0, JaccardSimilarity);

    tags1.add("Test");
    tags2.add("Test");

    JaccardSimilarity = similarityService.calculateJaccardSimilarity(tags1, tags2);
    Assertions.assertEquals(1.0, JaccardSimilarity);

    tags1.add("Test2");

    JaccardSimilarity = similarityService.calculateJaccardSimilarity(tags1, tags2);
    Assertions.assertEquals(0.5, JaccardSimilarity);

    tags1.add("Test3");
    JaccardSimilarity = similarityService.calculateJaccardSimilarity(tags1, tags2);
    Assertions.assertEquals(1.0 / 3.0, JaccardSimilarity);

    tags2.add("Test4");
    JaccardSimilarity = similarityService.calculateJaccardSimilarity(tags1, tags2);
    Assertions.assertEquals(0.25, JaccardSimilarity);
  }

  /** Test Get Overlapped Projects when too many Technologies are selected */
  @Test
  void testGetOverlappedProjects() {
    List<Long> technologyIds = List.of(1L);
    Object result = similarityService.getOverLappedProjects(technologyIds, new ArrayList<>());
    Assertions.assertInstanceOf(List.class, result);

    List<Long> technologyIdsMax =
        LongStream.rangeClosed(1, 51).boxed().collect(Collectors.toList());
    Assertions.assertThrows(
        TooManyTechnologiesSelectedException.class,
        () -> similarityService.getOverLappedProjects(technologyIdsMax, new ArrayList<>()));
  }
}

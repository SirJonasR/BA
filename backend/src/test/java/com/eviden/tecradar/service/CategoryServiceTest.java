package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.resource.TechnologyRequestForm;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** test for category service */
@QuarkusTest
public class CategoryServiceTest {
  @Inject CategoryService categoryService;
  @Inject TechnologyService technologyService;

  /** test if all already initialized categories are correctly. */
  @Test
  void testCorrectInitializedCategories() {
    List<Category> list = categoryService.getAll();
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                category ->
                    (category.getId().equals(-4L)
                        && category.getName().equals("Techniques & Methodologies"))));
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                category ->
                    (category.getId().equals(-3L) && category.getName().equals("Platforms"))));
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                category -> (category.getId().equals(-2L) && category.getName().equals("Tools"))));
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                category ->
                    (category.getId().equals(-1L)
                        && category.getName().equals("Languages & Frameworks"))));
  }

  /** test if correct value for categoryService.get() on existing Category. */
  @Test
  void testGetExistingCategory() {
    Technology technology = createTechnology();
    Long categoryId = categoryService.get(technology.getCategoryId()).getId();
    Assertions.assertNotNull(categoryId);
    Assertions.assertEquals(technology.getCategoryId(), categoryId);
  }

  /** test if correct value for categoryService.get() on nonexistent Category. */
  @Test
  void testGetNonExistentCategory() {
    Long categoryId = 10L;
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class, () -> categoryService.get(categoryId));
    Assertions.assertTrue((expectedException.getMessage().contains("No category found for id")));
  }

  private Technology createTechnology() {
    byte[] sampleData = Base64.getDecoder().decode("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    TechnologyRequestForm technologyRequestForm = new TechnologyRequestForm();
    technologyRequestForm.setName("QuarkusCategoryTest");
    technologyRequestForm.setDescription("Lorem ipsum dolor amet.");
    technologyRequestForm.setIsNewPic(true);
    technologyRequestForm.setPictureData(sampleData);
    technologyRequestForm.setCategoryId(-1L);
    technologyRequestForm.setLifecycleId(-1L);
    technologyRequestForm.setProjectIds(new ArrayList<>());
    technologyRequestForm.setConnectedTechnologyIds(new ArrayList<>());
    technologyRequestForm.setCertificationNames(new ArrayList<>());
    technologyRequestForm.setCertificationDescription(new ArrayList<>());
    return technologyService.create(technologyRequestForm, "luke");
  }
}

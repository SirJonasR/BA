package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Lifecycle;
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

/** test for lifecycle service */
@QuarkusTest
class LifecycleServiceTest {
  @Inject LifecycleService lifecycleService;
  @Inject TechnologyService technologyService;

  /** test if all already initialized lifecycle are correctly. */
  @Test
  void testCorrectInitializedLifecycles() {
    List<Lifecycle> list = lifecycleService.getAll();
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                lifecycle ->
                    (lifecycle.getId().equals(-4L) && lifecycle.getName().equals("Maintain"))));
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                lifecycle ->
                    (lifecycle.getId().equals(-3L) && lifecycle.getName().equals("Adopt"))));
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                lifecycle ->
                    (lifecycle.getId().equals(-2L) && lifecycle.getName().equals("Assess"))));
    Assertions.assertTrue(
        list.stream()
            .anyMatch(
                lifecycle ->
                    (lifecycle.getId().equals(-1L) && lifecycle.getName().equals("Monitor"))));
  }

  /** test if correct value for lifecycleService.get() on existing lifecycle. */
  @Test
  void testGetExistingLifecycle() {
    Technology technology = createTechnology();
    Long lifecycleId = lifecycleService.get(technology.getLifecycleId()).getId();
    Assertions.assertNotNull(lifecycleId);
    Assertions.assertEquals(technology.getLifecycleId(), lifecycleId);
  }

  /** test if correct value for lifecycleService.get() on nonexistent lifecycle. */
  @Test
  void testGetNonExistentLifecycle() {
    Long lifecycleId = 10L;
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class, () -> lifecycleService.get(lifecycleId));
    Assertions.assertTrue((expectedException.getMessage().contains("No lifecycle found for id")));
  }

  private Technology createTechnology() {
    byte[] sampleData = Base64.getDecoder().decode("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    TechnologyRequestForm technologyRequestForm = new TechnologyRequestForm();
    technologyRequestForm.setName("QuarkusLifecycleTest");
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

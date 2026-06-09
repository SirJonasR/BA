package com.eviden.tecradar.service;

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

/** test for picture service */
@QuarkusTest
class PictureServiceTest {
  @Inject TechnologyService technologyService;
  @Inject PictureService pictureService;

  /** test whether getting existing picture works */
  @Test
  void testGetExistingPicture() {
    Technology technology = createTechnology("Quarkus1");
    Long pictureId = pictureService.get(technology.getPictureId()).getId();
    Assertions.assertNotNull(pictureId);
    Assertions.assertEquals(technology.getPictureId(), pictureId);
  }

  /** test behavior for getting nonexistent picture */
  @Test
  void testGetNonExistentPicture() {
    Long pictureId = -10L;
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class, () -> pictureService.get(pictureId));
    Assertions.assertTrue((expectedException.getMessage().contains("No picture found for id")));
  }

  /** test whether deleting existing picture works */
  @Test
  void testDeleteExistingPicture() {
    Technology technology = createTechnology("Quarkus2");
    pictureService.delete(technology.getPictureId());
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class, () -> pictureService.get(technology.getPictureId()));
    Assertions.assertTrue(expectedException.getMessage().contains("No picture found for id"));
  }

  /** test whether deleting a nonexistent picture behaves correctly */
  @Test
  void testDeletePictureInvalidId() {
    Long nonExistentPictureId = -10L;
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class, () -> pictureService.get(nonExistentPictureId));
    Assertions.assertTrue(expectedException.getMessage().contains("No picture found for id"));
  }

  private Technology createTechnology(String name) {
    byte[] sampleData = Base64.getDecoder().decode("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    TechnologyRequestForm technologyRequestForm = new TechnologyRequestForm();
    technologyRequestForm.setName(name);
    technologyRequestForm.setDescription("Lorem ipsum dolor amet.");
    technologyRequestForm.setIsNewPic(true);
    technologyRequestForm.setPictureData(sampleData);
    technologyRequestForm.setCategoryId(-1L);
    technologyRequestForm.setLifecycleId(-1L);
    technologyRequestForm.setTags(List.of(new String[] {"tag1", "tag2"}));
    technologyRequestForm.setProjectIds(new ArrayList<>());
    technologyRequestForm.setConnectedTechnologyIds(new ArrayList<>());
    technologyRequestForm.setCertificationNames(new ArrayList<>());
    technologyRequestForm.setCertificationDescription(new ArrayList<>());
    return technologyService.create(technologyRequestForm, "luke");
  }
}

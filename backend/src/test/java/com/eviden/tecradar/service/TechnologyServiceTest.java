package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Tag;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.InvalidValueException;
import com.eviden.tecradar.exception.ResourceAlreadyExistsException;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.resource.TechnologyRequestForm;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for technology service */
@QuarkusTest
class TechnologyServiceTest {
  @Inject TechnologyService technologyService;
  @Inject TagService tagService;
  @Inject HistoryService historyService;

  /** test correct behavior for getting technology with existing id */
  @Test
  void testGetForExistingTechnology() {
    Long id = -2L;
    Technology technology = technologyService.get(id);
    Assertions.assertEquals(id, technology.getId());
    Assertions.assertEquals("IntelliJ", technology.getName());
    Assertions.assertEquals("Lorem ipsum dolor amet.", technology.getDescription());
    Assertions.assertEquals(-2, technology.getCategoryId());
    Assertions.assertEquals(-2, technology.getLifecycleId());
  }

  /** test correct behavior for getting technology with nonexistent id */
  @Test
  void testGetForNonExistentTechnology() {
    Long id = -10L;
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(ResourceNotFoundException.class, () -> technologyService.get(id));
    Assertions.assertTrue(expectedException.getMessage().contains("No technology found for id"));
  }

  /** test creating a valid new technology */
  @Test
  void testCreateValidTechnology() {
    String userName = "luke";
    String technologyName = "Qua";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);

    Technology technology = technologyService.create(exampleRequest, userName);
    Assertions.assertNotNull(technology);
    Assertions.assertEquals("Qua", technology.getName());
    Assertions.assertEquals("Lorem ipsum dolor amet.", technology.getDescription());
    Assertions.assertEquals(-1, technology.getCategoryId());
    Assertions.assertEquals(-1, technology.getLifecycleId());
    Assertions.assertTrue(exampleRequest.toString().contains("Qua"));
  }

  /** test creating an invalid technology */
  @Test
  void testCreateInvalidTechnology() {
    String userName = "luke";
    String technologyName = "Quarkus364";
    TechnologyRequestForm exampleRequest = createTechnologyForm(false, technologyName);

    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class,
            () -> technologyService.create(exampleRequest, userName));
    Assertions.assertTrue(expectedException.getMessage().contains("No category found for id"));
  }

  /** test creating an already existing technology */
  @Test
  void testCreateTechnologyWithAlreadyExistingName() {
    String userName = "luke";
    String technologyName = "Java";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);

    ResourceAlreadyExistsException expectedException =
        Assertions.assertThrows(
            ResourceAlreadyExistsException.class,
            () -> technologyService.create(exampleRequest, userName));
    Assertions.assertTrue(expectedException.getMessage().contains("Technology already exists"));
  }

  /** test creating a new technology with empty name. */
  @Test
  void testCreateTechnologyWithEmptyName() {
    String userName = "luke";
    String technologyName = "";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);

    IllegalArgumentException expectedException =
        Assertions.assertThrows(
            IllegalArgumentException.class,
            () -> technologyService.create(exampleRequest, userName));
    Assertions.assertTrue(
        expectedException.getMessage().contains("Technology name must not be empty"));
  }

  /** test updating existing technology */
  @Test
  void testUpdateForExistingTechnology() {
    String userName = "luke";
    String firstName = "QuarkusTestExisting";
    String secondName = "UpdatedQuarkusTestExisting";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, firstName);
    TechnologyRequestForm updatedRequest = createTechnologyForm(true, secondName);
    Technology technology = technologyService.create(exampleRequest, userName);
    Technology updatedTechnology =
        technologyService.update(technology.getId(), updatedRequest, userName);
    Assertions.assertEquals("QuarkusTestExisting", technology.getName());
    Assertions.assertEquals("UpdatedQuarkusTestExisting", updatedTechnology.getName());
    Assertions.assertEquals(technology.getId(), updatedTechnology.getId());
  }

  /** test updating nonexistent technology */
  @Test
  void testUpdateForNonExistentTechnology() {
    String userName = "luke";
    String secondName = "UpdatedQuarkus";
    TechnologyRequestForm updatedRequest = createTechnologyForm(false, secondName);
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class,
            () -> technologyService.update(-10L, updatedRequest, userName));
    Assertions.assertTrue(expectedException.getMessage().contains("No technology found for id"));
  }

  /** test updating technology with invalid values */
  @Test
  void testUpdateForInvalidTechnology() {
    String userName = "luke";
    String firstName = "QuarkusUpdateInvalid";
    String secondName = "UpdatedQuarkus2";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, firstName);
    TechnologyRequestForm updatedRequest = createTechnologyForm(false, secondName);
    Technology technology = technologyService.create(exampleRequest, userName);
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class,
            () -> technologyService.update(technology.getId(), updatedRequest, userName));
    Assertions.assertTrue(expectedException.getMessage().contains("No category found for id"));
  }

  /** test updating technology with already existing technology name. */
  @Test
  void testUpdateWithAlreadyExistingTechnologyName() {
    String userName = "luke";
    String technologyName = "NewJava";
    String technologyName2 = "Java";
    TechnologyRequestForm exampleRequestForm = createTechnologyForm(true, technologyName);
    TechnologyRequestForm updatedRequest = createTechnologyForm(true, technologyName2);
    Technology technology = technologyService.create(exampleRequestForm, userName);
    ResourceAlreadyExistsException expectedException =
        Assertions.assertThrows(
            ResourceAlreadyExistsException.class,
            () -> technologyService.update(technology.getId(), updatedRequest, userName));
    Assertions.assertTrue(expectedException.getMessage().contains("Technology already exists"));
  }

  /** test deleting an existing technology */
  @Test
  void deleteExistingTechnology() {
    String userName = "luke";
    String technologyName = "QuarkusDeletes";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);
    Technology technology = technologyService.create(exampleRequest, userName);
    technologyService.delete(technology.getId());
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class, () -> technologyService.get(technology.getId()));
    Assertions.assertTrue(expectedException.getMessage().contains("No technology found for id"));
  }

  /** test deleting a nonexistent technology */
  @Test
  void deleteNonExistentTechnology() {
    Long nonExistentTechnologyId = -10L;
    ResourceNotFoundException expectedException =
        Assertions.assertThrows(
            ResourceNotFoundException.class,
            () -> technologyService.delete(nonExistentTechnologyId));
    Assertions.assertTrue(expectedException.getMessage().contains("No technology found for id"));
  }

  /** Test remove orphaned tags on delete Technology */
  @Test
  void testRemoveOrphanedTags_deleteTechnology() {
    String tagName = "testTag";
    Tag tag1 = new Tag();
    tag1.setName(tagName);

    List<String> tags = new ArrayList<>();
    tags.add(tag1.getName());

    String userName = "luke";
    String technologyName = "technology";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);
    tagService.create(tag1);
    exampleRequest.setTags(tags);

    Technology testTechnology = technologyService.create(exampleRequest, userName);

    Assertions.assertEquals(tagName, tagService.get(tagName).getName());

    technologyService.delete(testTechnology.getId());

    Assertions.assertThrows(ResourceNotFoundException.class, () -> tagService.get(tagName));
  }

  /** Test if Tags are removed on Technology update */
  @Test
  void testRemoveOrphanedTags_updateTechnology() {
    String userName = "luke";
    String tagName = "testTag1";
    Tag tag1 = new Tag();
    tag1.setName(tagName);

    Tag tag2 = new Tag();
    tag2.setName("newTag1");

    tagService.create(tag1);
    tagService.create(tag2);

    List<String> oldTags = new ArrayList<>();
    oldTags.add(tag1.getName());
    oldTags.add(tag2.getName());

    List<String> newTags = new ArrayList<>();
    newTags.add(tag2.getName());

    String technologyName = "testTechnology";
    String updatedTechnologyName = "updateTestTechnology";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);
    exampleRequest.setTags(oldTags);
    TechnologyRequestForm updateRequest = createTechnologyForm(true, updatedTechnologyName);
    updateRequest.setTags(newTags);
    Technology testTechnology = technologyService.create(exampleRequest, userName);

    Assertions.assertEquals(tagName, tagService.get(tagName).getName());

    technologyService.update(testTechnology.getId(), updateRequest, userName);

    Assertions.assertThrows(ResourceNotFoundException.class, () -> tagService.get(tagName));
  }

  /** Test if History Changes */
  @Test
  void testCheckHistoryChanges() {
    String userName = "luke";
    String technologyName = "testTechnology1";
    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);
    TechnologyRequestForm updateRequest = createTechnologyForm(true, technologyName);
    updateRequest.setCategoryId(exampleRequest.getCategoryId());
    updateRequest.setLifecycleId(exampleRequest.getLifecycleId());

    Technology testTechnology = technologyService.create(exampleRequest, userName);
    technologyService.update(testTechnology.getId(), updateRequest, userName);

    Assertions.assertEquals(
        2, historyService.getHistoryForTechnology(testTechnology.getId()).size());
  }

  /** Test if History does not Change when only Tags change */
  //  @Test
  //  void testCheckHistoryDidNotChange() {
  //    String userName = "luke";
  //    String technologyName = "testTechnology2";
  //    TechnologyRequestForm exampleRequest = createTechnologyForm(true, technologyName);
  //    TechnologyRequestForm updateRequest = createTechnologyForm(true, technologyName);
  //    updateRequest.setCategoryId(exampleRequest.getCategoryId());
  //    updateRequest.setLifecycleId(exampleRequest.getLifecycleId());
  //    updateRequest.setIsNewPic(false);
  //
  //    Tag tag1 = new Tag();
  //    tag1.setName("Tag1");
  //
  //    List<String> newTags = new ArrayList<>();
  //    newTags.add(tag1.getName());
  //
  //
  //
  //    Technology testTechnology = technologyService.create(exampleRequest, userName);
  //    technologyService.update(testTechnology.getId(), exampleRequest, userName);
  //
  //    Assertions.assertEquals(
  //        1, historyService.getHistoryForTechnology(testTechnology.getId()).size());
  //  }

  @Test
  void createTechnologyInvalidValues() {
    String userName = "luke";
    String technologyName = "LongDescription";
    TechnologyRequestForm request = createTechnologyForm(true, technologyName);
    StringBuilder longText = new StringBuilder();
    for (int i = 0; i <= 1801; i++) {
      longText.append(i);
    }
    request.setDescription(longText.toString());
    InvalidValueException expectedException =
        Assertions.assertThrows(
            InvalidValueException.class, () -> technologyService.create(request, userName));
    Assertions.assertTrue(
        expectedException
            .getMessage()
            .contains("Description must have a value and be under 1800 characters"));

    request.setDescription(null);
    InvalidValueException expectedException2 =
        Assertions.assertThrows(
            InvalidValueException.class, () -> technologyService.create(request, userName));
    Assertions.assertTrue(
        expectedException2
            .getMessage()
            .contains("Description must have a value and be under 1800 characters"));

    request.setDescription("");
    InvalidValueException expectedException3 =
        Assertions.assertThrows(
            InvalidValueException.class, () -> technologyService.create(request, userName));
    Assertions.assertTrue(
        expectedException3
            .getMessage()
            .contains("Description must have a value and be under 1800 characters"));

    request.setDescription("sometihgn");
    request.setShortDescription(longText.toString());
    InvalidValueException expectedException4 =
        Assertions.assertThrows(
            InvalidValueException.class, () -> technologyService.create(request, userName));
    Assertions.assertTrue(
        expectedException4.getMessage().contains("Short Description must be under 300 characters"));

    request.setShortDescription("Something");
    request.setName(longText.toString());
    InvalidValueException expectedException5 =
        Assertions.assertThrows(
            InvalidValueException.class, () -> technologyService.create(request, userName));
    Assertions.assertTrue(
        expectedException5
            .getMessage()
            .contains("Name must have a value and be under 255 characters"));
  }

  private TechnologyRequestForm createTechnologyForm(boolean valid, String name) {
    byte[] sampleData = Base64.getDecoder().decode("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    TechnologyRequestForm technologyRequestForm = new TechnologyRequestForm();
    technologyRequestForm.setName(name);
    technologyRequestForm.setDescription("Lorem ipsum dolor amet.");
    technologyRequestForm.setShortDescription("Short description");
    technologyRequestForm.setIsNewPic(true);
    technologyRequestForm.setPictureData(sampleData);
    technologyRequestForm.setCategoryId(valid ? -1L : 6L);
    technologyRequestForm.setLifecycleId(valid ? -1L : 6L);
    technologyRequestForm.setProjectIds(new ArrayList<>());
    technologyRequestForm.setConnectedTechnologyIds(new ArrayList<>());
    technologyRequestForm.setCertificationNames(new ArrayList<>());
    technologyRequestForm.setCertificationDescription(new ArrayList<>());
    technologyRequestForm.setPriority(false);
    technologyRequestForm.setCertificatePrerequisites(new ArrayList<>());
    technologyRequestForm.setCertificateFollowUps(new ArrayList<>());
    return technologyRequestForm;
  }
}

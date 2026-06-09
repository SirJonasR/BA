package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.eviden.tecradar.entity.Tag;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.TagRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.ws.rs.NotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

/** tests for tag service. */
@QuarkusTest
class TagServiceTest {

  @Mock TagRepository tagRepository;

  @InjectMocks TagService tagService;

  @BeforeEach
  void setUp() {
    MockitoAnnotations.initMocks(this);
  }

  /** test getting all tags works. */
  @Test
  void testGetAll() {
    when(tagRepository.listAll()).thenReturn(Arrays.asList(new Tag(), new Tag()));

    assertEquals(2, tagService.getAll().size());
  }

  /** test getting a valid tag. */
  @Test
  void testGetValidTag() {
    Tag expectedTag = new Tag();
    expectedTag.setName("Java");

    when(tagRepository.findByName("Java")).thenReturn(expectedTag);

    Tag actualTag = tagService.get("Java");

    assertEquals(expectedTag, actualTag);
  }

  /** test getting invalid tag. */
  @Test
  void testGetInvalidTag() {
    when(tagRepository.findByName("Nonexistent")).thenReturn(null);

    assertThrows(
        ResourceNotFoundException.class,
        () -> {
          tagService.get("Nonexistent");
        });
  }

  /** Test successfull tag update */
  @Test
  public void testUpdateTag_Success() {
    // Arrange
    String oldName = "OldTag";
    String newName = "NewTag";
    String userName = "User";

    Tag oldTag = new Tag();
    oldTag.setName(oldName);

    List<Technology> technologies = new ArrayList<>();

    oldTag.setTechnologies(technologies);

    when(tagRepository.findByName(oldName)).thenReturn(oldTag);
    when(tagRepository.findByName(newName)).thenReturn(null);

    // Act
    Tag updatedTag = tagService.update(oldName, newName);

    // Assert
    assertEquals(newName, updatedTag.getName());
    verify(tagRepository, times(1)).delete(oldTag);
    verify(tagRepository, times(1)).persistAndFlush(updatedTag);
  }

  @Test
  public void testUpdateTag_TagNotFound() {
    // Arrange
    String oldName = "NonExistentTag";
    String newName = "NewTag";
    String userName = "User";

    when(tagRepository.findByName(oldName)).thenReturn(null);

    // Act and Assert
    assertThrows(NotFoundException.class, () -> tagService.update(oldName, newName));
  }

  @Test
  public void testUpdateTag_DuplicateTagName() {
    // Arrange
    String oldName = "OldTag";
    String newName = "ExistingTag";

    Tag oldTag = new Tag();
    oldTag.setName(oldName);
    Tag existingTag = new Tag();
    existingTag.setName(newName);

    when(tagRepository.findByName(oldName)).thenReturn(oldTag);
    when(tagRepository.findByName(newName)).thenReturn(existingTag);

    // Act and Assert
    assertThrows(IllegalArgumentException.class, () -> tagService.update(oldName, newName));
  }

  @Test
  public void testUpdateTag_TagNameTooLong() {
    // Arrange
    String oldName = "OldTag";
    String newName = "ThisIsAVeryLongTagNameThatExceedsMaxLength";

    Tag oldTag = new Tag();
    oldTag.setName(oldName);

    when(tagRepository.findByName(oldName)).thenReturn(oldTag);

    // Act and Assert
    assertThrows(IllegalArgumentException.class, () -> tagService.update(oldName, newName));
  }

  @Test
  public void testUpdateTag_TagNameEmpty() {
    // Arrange
    String oldName = "OldTag";
    String newName = "";

    Tag oldTag = new Tag();
    oldTag.setName(oldName);

    when(tagRepository.findByName(oldName)).thenReturn(oldTag);

    // Act and Assert
    assertThrows(IllegalArgumentException.class, () -> tagService.update(oldName, newName));
  }

  @Test
  public void testCreateTag_Success() {
    // Arrange
    String tagName = "NewTag";
    String userName = "User";

    Tag newTag = new Tag();
    newTag.setName(tagName);

    when(tagRepository.findByName(tagName)).thenReturn(null);

    // Act
    Tag createdTag = tagService.create(newTag);

    // Assert
    assertEquals(tagName, createdTag.getName());
    verify(tagRepository, times(1)).persistAndFlush(newTag);
  }

  @Test
  public void testCreateTag_DuplicateTagName() {
    // Arrange
    String tagName = "ExistingTag";
    String userName = "User";

    Tag existingTag = new Tag();
    existingTag.setName(tagName);

    when(tagRepository.findByName(tagName)).thenReturn(existingTag);

    // Act and Assert
    assertThrows(IllegalArgumentException.class, () -> tagService.create(existingTag));
    verify(tagRepository, never()).persistAndFlush(any());
  }

  @Test
  public void testCreateTag_TagNameTooLong() {
    // Arrange
    String tagName = "ThisIsAVeryLongTagNameThatExceedsMaxLength";
    String userName = "User";

    Tag newTag = new Tag();
    newTag.setName(tagName);

    // Act and Assert
    assertThrows(IllegalArgumentException.class, () -> tagService.create(newTag));
    verify(tagRepository, never()).persistAndFlush(any());
  }

  @Test
  public void testDeleteTag_Success() {
    // Arrange
    String tagName = "TagToDelete";

    Tag tagToDelete = new Tag();
    tagToDelete.setName(tagName);

    when(tagRepository.findByName(tagName)).thenReturn(tagToDelete);

    // Act
    tagService.delete(tagName);

    // Assert
    verify(tagRepository, times(1)).delete(tagToDelete);
  }
}

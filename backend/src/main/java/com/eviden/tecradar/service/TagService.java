package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Tag;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.TagRepository;
import com.eviden.tecradar.resource.TechnologyRequestForm;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.jboss.logging.Logger;

/**
 * Service class for handling operations related to Tag entities. It is used for creating, reading,
 * updating and deleting Tag entities, as well as obtaining a list of all Tag entities in the
 * database.
 *
 * @author mscherz
 */
@ApplicationScoped
public class TagService {

  @Inject TagRepository tagRepository;
  private static final Logger logger = Logger.getLogger(TagService.class);

  /**
   * Fetches all Tag entities from the database.
   *
   * @return a list of all Tag entities stored in the database.
   */
  public List<String> getAll() {
    List<Tag> tags = tagRepository.listAll();
    List<String> tagNames = new ArrayList<>();
    for (Tag tag : tags) {
      tagNames.add(tag.getName());
    }
    return tagNames;
  }

  /**
   * Fetches a Tag entity by its name.
   *
   * @param name the name of the Tag entity to fetch.
   * @return the Tag entity with the specified name.
   * @throws ResourceNotFoundException if no Tag entity with the specified name is found.
   */
  public Tag get(String name) {
    Tag tag = tagRepository.findByName(name);

    if (tag == null) {
      throw new ResourceNotFoundException("No tag found for name = " + name);
    }
    return tag;
  }

  /**
   * Creates a new Tag entity and stores it in the database.
   *
   * @param tag Tag entity to create.
   * @return the newly created Tag entity.
   */
  @Transactional
  public Tag create(Tag tag) {
    Tag existingTag = tagRepository.findByName(tag.getName().strip());

    if (existingTag != null) {
      logger.warn("Tag with this name already exists");
      throw new IllegalArgumentException("Tag with this name already exists");
    }

    if (tag.getName().length() > 25) {
      logger.warn("Tag name is too long, max 25 characters");
      throw new IllegalArgumentException("Tag name is too long, max 25 characters");
    }

    tag.setName(tag.getName().strip());
    logger.info("Tag " + tag.getName() + " created");
    tagRepository.persistAndFlush(tag);
    return tag;
  }

  /**
   * Updates a Tag entity in the database.
   *
   * @param oldName the current name of the Tag entity.
   * @param newName the new name to be set for the Tag entity.
   * @return the updated Tag entity.
   * @throws NotFoundException if the tag is not found.
   */
  @Transactional
  public Tag update(String oldName, String newName) {
    Tag oldTag = tagRepository.findByName(oldName);
    if (oldTag == null) {
      logger.warn("Tag not found");
      throw new NotFoundException("Tag not found");
    }

    Tag existingTag = tagRepository.findByName(newName);
    if (existingTag != null) {
      logger.warn("Tag with the new name already exists");
      throw new IllegalArgumentException("Tag with the new name already exists");
    }

    if (newName.length() > 25) {
      logger.warn("Tag name is too long, max 25 characters");
      throw new IllegalArgumentException("Tag name is too long, max 25 characters");
    }

    if (newName.isBlank()) {
      logger.warn("Tag name cannot be empty");
      throw new IllegalArgumentException("Tag name cannot be empty");
    }

    Tag newTag = new Tag();
    newTag.setName(newName);
    newTag.setTechnologies(oldTag.getTechnologies());

    for (Technology t : newTag.getTechnologies()) {
      t.addTag(newTag);
    }

    tagRepository.delete(oldTag);
    logger.info("New Tag " + newTag.getName() + " updated from old Tag " + oldName);
    tagRepository.persistAndFlush(newTag);
    return newTag;
  }

  /**
   * Deletes a Tag entity from the database.
   *
   * @param name the name of the Tag entity to delete.
   */
  @Transactional
  public void delete(String name) {
    Tag tag = get(name);
    logger.info("Tag " + name + " deleted");
    tagRepository.delete(tag);
  }

  /**
   * Get a tag from the database or create a new one if it does not exist.
   *
   * @param name the name of the tag
   * @return the tag
   */
  @Transactional
  public Tag getOrCreate(String name) {
    Tag tag = tagRepository.findByName(name.strip());
    if (tag == null) {
      tag = new Tag();
      tag.setName(name.strip());
      logger.info("Tag " + name + " created");
      tagRepository.persistAndFlush(tag);
    }
    return tag;
  }

  /**
   * Get a list of tags from the database or create new ones if they do not exist.
   *
   * @param technologyRequestForm the request containing the tags
   * @return the list of tags
   */
  public List<Tag> getTags(TechnologyRequestForm technologyRequestForm) {
    Set<Tag> tagSet = new LinkedHashSet<>();

    List<String> tags = technologyRequestForm.getTags();
    if (tags == null) {
      return new ArrayList<>();
    }

    for (String tagName : tags) {
      if (tagName == null || tagName.isEmpty() || tagName.isBlank()) {
        continue;
      }
      Tag tag = getOrCreate(tagName);
      tagSet.add(tag);
    }

    return new ArrayList<>(tagSet);
  }
}

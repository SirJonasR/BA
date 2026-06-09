package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for technology entity. */
@QuarkusTest
class TechnologyTest {
  @Test
  void testAddTag() {
    Technology technology = new Technology();
    Tag tag = new Tag();
    tag.setName("tag");
    technology.setTags(new ArrayList<>(List.of()));
    technology.addTag(tag);
    Assertions.assertTrue(technology.getTags().contains(tag.getName()));
    technology.removeTag(tag);
    Assertions.assertFalse(technology.getTags().contains(tag.getName()));
  }
}

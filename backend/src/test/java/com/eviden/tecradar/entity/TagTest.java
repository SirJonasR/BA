package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for tag entity */
@QuarkusTest
class TagTest {
  @Test
  void testName() {
    Tag tag = new Tag();
    Assertions.assertEquals("", tag.getName());
    tag.setName("testTag");
    Assertions.assertEquals("testTag", tag.getName());
  }

  @Test
  void testEmptyName() {
    Tag tag = new Tag();

    Assertions.assertThrows(
        IllegalArgumentException.class,
        () -> {
          tag.setName("");
        });
  }

  @Test
  void testNameWithSpaces() {
    Tag tag = new Tag();
    tag.setName("test tag");

    Assertions.assertEquals("test tag", tag.getName());
  }

  @Test
  void testSetTechnologies() {
    Tag tag = new Tag();
    tag.setTechnologies(List.of(new Technology()));
    Assertions.assertEquals(1, tag.getTechnologies().size());
  }
}

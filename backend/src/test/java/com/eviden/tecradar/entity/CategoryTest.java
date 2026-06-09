package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** test for category entity. (just tests, which are not already covered in other tests). */
@QuarkusTest
class CategoryTest {

  @Test
  void testSetName() {
    Category category = new Category();
    category.setName("TestCategory");
    Assertions.assertEquals("TestCategory", category.getName());
  }

  @Test
  void testSetId() {
    Category category = new Category();
    category.setId(1L);
    Assertions.assertEquals(1, category.getId());
  }

  @Test
  void testSetDescription() {
    Category category = new Category();
    category.setDescription("TestDescription");
    Assertions.assertEquals("TestDescription", category.getDescription());
  }
}

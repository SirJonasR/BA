package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for lifecycle entity */
@QuarkusTest
class LifecycleTest {

  @Test
  void testAllSetters() {
    Lifecycle lifecycle = new Lifecycle();
    lifecycle.setId(10L);
    lifecycle.setName("testLifecycle");
    lifecycle.setSort(1);
    lifecycle.setDescription("testDescription");
    Assertions.assertEquals(10, lifecycle.getId());
    Assertions.assertEquals("testLifecycle", lifecycle.getName());
    Assertions.assertEquals("testDescription", lifecycle.getDescription());
    Assertions.assertEquals(1, lifecycle.getSort());
  }
}

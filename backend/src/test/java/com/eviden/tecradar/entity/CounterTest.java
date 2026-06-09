package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class CounterTest {

  @Test
  void testSetId() {
    Counter counter = new Counter();
    counter.setId(1L);
    Assertions.assertEquals(1, counter.getId());
  }

  @Test
  void testGetTechnology() {
    Counter counter = new Counter();
    Technology technology = new Technology();
    technology.setId(1L);
    counter.setTechnology(technology);
    Assertions.assertEquals(1, counter.getTechnology().getId());
  }

  @Test
  void testGetUser() {
    Counter counter = new Counter();
    User user = new User();
    user.setUserName("testName");
    counter.setUser(user);
    Assertions.assertEquals("testName", counter.getUser().getUserName());
  }
}

package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Counter;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

/** test for counter service */
@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CounterServiceTest {

  @Inject CounterService counterService;
  @Inject TechnologyService technologyService;
  @Inject UserService userService;

  Technology technology;
  User user;

  @BeforeEach
  void setUp() {
    technology = technologyService.get(-2L);
    user = userService.get("luke");
  }

  @Test
  @Order(1)
  void testIncrementCounter() {
    counterService.incrementCounter(user, technology);

    Counter counter = counterService.counterRepository.findByTechnologyAndUser(technology, user);
    Assertions.assertEquals(1, counter.getViewCount());
  }

  @Test
  @Order(2)
  void testIncrementCounterExistingCounter() {
    counterService.incrementCounter(user, technology);

    Counter counter = counterService.counterRepository.findByTechnologyAndUser(technology, user);
    Assertions.assertEquals(2, counter.getViewCount());
  }

  @Test
  @Order(3)
  void testGetAllCounter() {
    List<Counter> counterList = counterService.getAll();
    Assertions.assertEquals(1, counterList.size());
  }

  @Test
  @Order(4)
  void testDeleteCounterByTechnology() {
    counterService.deleteByTechnology(technology);
    List<Counter> counterList = counterService.getAllByTechnology(technology);
    Assertions.assertEquals(0, counterList.size());
  }
}

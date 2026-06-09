package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for ContactHistory entity. */
@QuarkusTest
public class ContactHistoryTest {

  @Test
  void testIdGetterSetter() {
    ContactHistory contactHistory = new ContactHistory();
    Long expectedId = 1L;
    contactHistory.setId(expectedId);
    Assertions.assertEquals(expectedId, contactHistory.getId());
  }

  @Test
  void testEmailGetterSetter() {
    ContactHistory contactHistory = new ContactHistory();
    String expectedEmail = "history@example.com";
    contactHistory.setEmail(expectedEmail);
    Assertions.assertEquals(expectedEmail, contactHistory.getEmail());
  }

  @Test
  void testRoleGetterSetter() {
    ContactHistory contactHistory = new ContactHistory();
    String expectedRole = "owner";
    contactHistory.setRole(expectedRole);
    Assertions.assertEquals(expectedRole, contactHistory.getRole());
  }

  @Test
  void testProjectHistoryGetterSetter() {
    ContactHistory contactHistory = new ContactHistory();
    ProjectHistory projectHistory = new ProjectHistory();
    projectHistory.setId(1L);
    contactHistory.setProjectHistory(projectHistory);
    Assertions.assertEquals(projectHistory, contactHistory.getProjectHistory());
  }
}

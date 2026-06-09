package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for Contact entity. */
@QuarkusTest
public class ContactTest {

  @Test
  void testIdGetterSetter() {
    Contact contact = new Contact();
    Long expectedId = 1L;
    contact.setId(expectedId);
    Assertions.assertEquals(expectedId, contact.getId());
  }

  @Test
  void testEmailGetterSetter() {
    Contact contact = new Contact();
    String expectedEmail = "contact@example.com";
    contact.setEmail(expectedEmail);
    Assertions.assertEquals(expectedEmail, contact.getEmail());
  }

  @Test
  void testRoleGetterSetter() {
    Contact contact = new Contact();
    String expectedRole = "owner";
    contact.setRole(expectedRole);
    Assertions.assertEquals(expectedRole, contact.getRole());
  }

  @Test
  void testProjectGetterSetter() {
    Contact contact = new Contact();
    Project project = new Project();
    project.setId(1L);
    contact.setProject(project);
    Assertions.assertEquals(project, contact.getProject());
  }
}

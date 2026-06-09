package com.eviden.tecradar.entity;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for ContactForm entity. */
@QuarkusTest
public class ContactFormTest {

  @Test
  void testIdGetterSetter() {
    ContactForm contactForm = new ContactForm();
    Long expectedId = 1L;
    contactForm.setId(expectedId);
    Assertions.assertEquals(expectedId, contactForm.getId());
  }

  @Test
  void testUserGetterSetter() {
    ContactForm contactForm = new ContactForm();
    User user = new User();
    user.setUserName("testUser");
    contactForm.setUser(user);
    Assertions.assertEquals(user, contactForm.getUser());
  }

  @Test
  void testGetUsername() {
    ContactForm contactForm = new ContactForm();
    User user = new User();
    String expectedUsername = "testUser";
    user.setUserName(expectedUsername);
    contactForm.setUser(user);
    Assertions.assertEquals(expectedUsername, contactForm.getUsername());
  }
}

package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.ContactForm;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ContactFormServiceTest {

  @Inject ContactFormService contactFormService;

  @Test
  @Order(1)
  void testCreate() {
    ContactForm contactForm = contactFormService.create("luke");
    Assertions.assertNotNull(contactForm);
    ContactForm contactForm1 = contactFormService.create("newLuke");
    Assertions.assertNotNull(contactForm1);
  }

  @Test
  @Order(2)
  void testDoesAgreementExist() {
    Assertions.assertTrue(contactFormService.doesAgreementExist("luke"));
    Assertions.assertFalse(contactFormService.doesAgreementExist("notExisting"));
  }

  @Test
  @Order(3)
  void testDeleteConsent() {
    contactFormService.deleteConsent("newLuke");
    Assertions.assertTrue(contactFormService.getAll("newLuke").isEmpty());
  }

  @Test
  @Order(4)
  void testGetAll() {
    List<ContactForm> contactForms = contactFormService.getAll("luke");
    Assertions.assertEquals(-1, contactForms.get(0).getId());
    Assertions.assertEquals("2022-10-06T07:20:35.765", contactForms.get(0).getDate().toString());
    Assertions.assertEquals("luke", contactForms.get(0).getUsername());
  }
}

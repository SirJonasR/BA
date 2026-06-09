package com.eviden.tecradar.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.eviden.tecradar.resource.ContactRequestForm;
import io.quarkus.mailer.Attachment;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.MockMailbox;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class MailServiceTest {

  @Inject MockMailbox mailbox;

  @Inject MailService mailService;

  @BeforeEach
  void init() {
    mailbox.clear();
  }

  @Test
  void testSendMail() {
    List<String> attachmentName = new ArrayList<>();
    List<String> attachmentContentType = new ArrayList<>();
    List<InputStream> attachmentData = new ArrayList<>();
    long id = 1;
    InputStream testInputStream =
        IOUtils.toInputStream("some test data for my input stream", "UTF-8");
    attachmentName.add("test.txt");
    attachmentContentType.add("text/plain");
    attachmentData.add(testInputStream);
    ContactRequestForm mailRequestForm = new ContactRequestForm();
    mailRequestForm.setMailType("Test Mail");
    mailRequestForm.setDescription("Test Description");
    mailRequestForm.setMailAddress("test@atos.net");
    mailRequestForm.setAttachmentFileName(attachmentName);
    mailRequestForm.setAttachmentData(attachmentData);
    mailRequestForm.setAttachmentContentType(attachmentContentType);
    Response response = mailService.sendMail(mailRequestForm, id);
    assertEquals(Response.Status.ACCEPTED.getStatusCode(), response.getStatus());

    // Check the mock mailbox for sent emails
    List<Mail> sentEmails = mailbox.getMailsSentTo("tecradar@atos.net");
    assertEquals(1, sentEmails.size());
    Mail sentMail = sentEmails.get(0);
    assertEquals("tecradar@atos.net", sentMail.getTo().get(0));
    assertEquals("Test Mail #1", sentMail.getSubject());
    assertEquals(mailRequestForm.toString(), sentMail.getText());
    assertEquals(1, sentMail.getAttachments().size());
    Attachment attachment = sentMail.getAttachments().get(0);
    assertEquals("test.txt", attachment.getName());
    assertEquals("text/plain", attachment.getContentType());
  }

  @Test
  void sendMailRevokeConsentTest() {
    mailService.sendMailRevokeConsent("testmail@test.com");
    List<Mail> sentEmails = mailbox.getMailsSentTo("testmail@test.com");
    assertEquals(1, sentEmails.size());
    assertEquals(
        "Datenschutzerklärung wurde erfolgreich widerrufen", sentEmails.get(0).getSubject());
    assertEquals(
        "Deine Datenschutzerklärung wurde erfolgreich widerrufen. \n"
            + "Mit den Besten Grüßen dein Tecradar Eviden Team",
        sentEmails.get(0).getText());
  }

  @Test
  void sendMailInternTest() {
    String subject = "Test Subject";
    String text = "Test Text";
    Response response = mailService.sendMailIntern(subject, text);
    assertEquals(Response.Status.ACCEPTED.getStatusCode(), response.getStatus());
    List<Mail> sentEmails = mailbox.getMailsSentTo("tecradar@atos.net");
    assertEquals("Test Subject", sentEmails.get(0).getSubject());
    assertEquals("Test Text", sentEmails.get(0).getText());
  }
}

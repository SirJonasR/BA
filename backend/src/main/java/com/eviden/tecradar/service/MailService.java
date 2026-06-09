package com.eviden.tecradar.service;

import com.eviden.tecradar.resource.ContactRequestForm;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.jboss.logging.Logger;

/** Service for Mail related tasks. */
@ApplicationScoped
public class MailService {
  @Inject Mailer mailer;
  @Inject Logger logger;

  /**
   * Builds a Mail and sends it.
   *
   * @param contactRequestForm necessary information for generating a Mail
   * @return Returns a response
   */
  public Response sendMail(ContactRequestForm contactRequestForm, Long id) {
    try {
      Mail mail =
          Mail.withText(
              "tecradar@atos.net",
              contactRequestForm.getMailType() + " #" + id,
              contactRequestForm.toString());
      for (int i = 0; i < contactRequestForm.getAttachmentData().size(); i++) {
        mail.addAttachment(
            contactRequestForm.getAttachmentFileName().get(i),
            contactRequestForm.getAttachmentData().get(i).readAllBytes(),
            contactRequestForm.getAttachmentContentType().get(i));
        contactRequestForm.getAttachmentData().get(i).close();
      }
      mailer.send(mail);
      return Response.accepted().build();
    } catch (IllegalArgumentException e) {
      logger.warn("Invalid email parameters: ", e);
      return Response.status(Response.Status.BAD_REQUEST)
          .entity("Invalid email parameters: " + e.getMessage())
          .build();
    } catch (Exception e) {
      logger.error("Failed to send email: ", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to send email: " + e.getMessage())
          .build();
    }
  }

  /**
   * Sends an email that the agreement to data protection is revoked.
   *
   * @param mailAddress from the user
   */
  public void sendMailRevokeConsent(String mailAddress) {
    try {
      Mail mail =
          Mail.withText(
              mailAddress,
              "Datenschutzerklärung wurde erfolgreich widerrufen",
              "Deine Datenschutzerklärung wurde erfolgreich widerrufen. \n"
                  + "Mit den Besten Grüßen dein Tecradar Eviden Team");
      mailer.send(mail);

    } catch (IllegalArgumentException e) {
      logger.warn("Invalid email parameters: " + e.getMessage());
      throw new IllegalArgumentException("Invalid email address: " + mailAddress);
    } catch (Exception e) {
      logger.error("Failed to send email: ", e);
    }
  }

  /**
   * Builds and sends an email to intern mail-address.
   *
   * @param subject of the mail
   * @param text of mail
   * @return a response
   */
  public Response sendMailIntern(String subject, String text) {
    try {
      Mail mail = Mail.withText("tecradar@atos.net", subject, text);
      mailer.send(mail);
      return Response.accepted().build();
    } catch (IllegalArgumentException e) {
      logger.warn("Invalid email parameters: " + subject + ", " + text);
      return Response.status(Response.Status.BAD_REQUEST)
          .entity("Invalid email parameters: " + subject + ", " + text)
          .build();
    } catch (Exception e) {
      logger.error("Failed to send email: ", e);
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
          .entity("Failed to send email: " + e.getMessage())
          .build();
    }
  }
}

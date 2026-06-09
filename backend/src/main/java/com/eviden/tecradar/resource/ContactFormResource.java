package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.ContactForm;
import com.eviden.tecradar.service.ContactFormService;
import com.eviden.tecradar.service.MailService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

/** Controller for the ContactForm REST endpoint. */
@Path("/contact")
@Produces(MediaType.APPLICATION_JSON)
public class ContactFormResource {

  @Inject MailService mailService;
  @Inject SecurityIdentity securityIdentity;
  @Inject ContactFormService contactFormService;

  /**
   * Sends a new Mail to the MailServer and saves the Username in Database.
   *
   * @param contactRequestForm necessary information for a new mail
   */
  @POST
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  @RateLimited(bucket = "userRateLimit", identityResolver = UsernameResolver.class)
  public Response sendContactForm(ContactRequestForm contactRequestForm) {
    String username = securityIdentity.getPrincipal().getName();
    ContactForm contactForm = contactFormService.create(username);

    return mailService.sendMail(contactRequestForm, contactForm.getId());
  }

  /**
   * Returns all ContactForms for the logged User.
   *
   * @return Returns a List of ContactForm Objects.
   */
  @GET
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public List<ContactForm> getAll() {
    String username = securityIdentity.getPrincipal().getName();
    return contactFormService.getAll(username);
  }

  /**
   * Deletes entry from the database with the given username. Also sends an email to ourselves to
   * inform us about it. If user gave his/her email, we also send a confirmation mail.
   *
   * @return a response if successfully.
   */
  @DELETE
  @Consumes
  @Path("/revoke-consent")
  public Response revokeConsent(@QueryParam("email") String emailAddress) {
    String username = securityIdentity.getPrincipal().getName();
    contactFormService.deleteConsent(username);
    String subject = "Revoke Consent";
    String text = "The User " + username + " revokes his/her agreement to data protection ";
    if (emailAddress != null && !emailAddress.trim().isEmpty()) {
      mailService.sendMailRevokeConsent(emailAddress);
    }
    return mailService.sendMailIntern(subject, text);
  }

  /**
   * Checks if the user has already agreed to the data protection law.
   *
   * @return if an entry exists
   */
  @GET
  @Consumes
  @Path("/agreement")
  public boolean doesAgreementExist() {
    String username = securityIdentity.getPrincipal().getName();
    return contactFormService.doesAgreementExist(username);
  }
}

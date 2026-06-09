package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.ContactForm;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.repository.ContactFormRepository;
import com.eviden.tecradar.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import org.jboss.logging.Logger;

/** Service for ContactForm related Tasks. */
@ApplicationScoped
public class ContactFormService {

  @Inject ContactFormRepository contactFormRepository;
  @Inject UserRepository userRepository;
  @Inject Logger logger;

  /**
   * Method to create a new Database Entry for Contact Form Table if there is no entry from the
   * user.
   *
   * @param username The username of the user whose ContactForm entry is to be created.
   * @return Generated ContactForm Object.
   */
  @Transactional
  public ContactForm create(String username) {
    ContactForm contactForm = new ContactForm();
    User user = userRepository.findByUserName(username);
    if (contactFormRepository.findByUserId(user) == null) {
      contactForm.setDate();
      contactForm.setUser(userRepository.findByUserName(username));
      contactFormRepository.persistAndFlush(contactForm);
    } else {
      contactForm = contactFormRepository.findByUserId(user);
    }
    logger.info("ContactForm with Id " + contactForm.getId() + " created");
    return contactForm;
  }

  /**
   * Method to return all ContactForm Entries of a User.
   *
   * @param username The username of the user whose ContactForm entries are to be retrieved.
   * @return Returns all Contact Form Objects of a User.
   */
  public List<ContactForm> getAll(String username) {
    return contactFormRepository.listAllByUser(userRepository.findByUserName(username));
  }

  /**
   * Method deletes agreement in the database.
   *
   * @param username The username of the user whose agreement we revoke.
   */
  @Transactional
  public void deleteConsent(String username) {
    ContactForm contactForm =
        contactFormRepository.findByUserId(userRepository.findByUserName(username));
    if (contactForm != null) {
      logger.info("ContactForm with Id " + contactForm.getId() + " deleted");
      contactFormRepository.delete(contactForm);
    }
  }

  /**
   * Method to check if entry exists with given username.
   *
   * @param username The username of the user whose agreement we want to check
   * @return if entry exists
   */
  public boolean doesAgreementExist(String username) {
    return contactFormRepository.findByUserId(userRepository.findByUserName(username)) != null;
  }
}

package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.ContactForm;
import com.eviden.tecradar.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import org.jboss.logging.Logger;

/** Repository for ContactForm entity. */
@ApplicationScoped
public class ContactFormRepository implements PanacheRepository<ContactForm> {
  @Inject Logger logger;

  public List<ContactForm> listAllByUser(User user) {
    return find("user = ?1", user).list();
  }

  public ContactForm findByUserId(User user) {
    logger.debug("Querying user by userId: " + (user != null ? user.getId() : "null"));
    return find("user", user).firstResult();
  }
}

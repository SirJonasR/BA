package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/** Repository for user entity. */
@ApplicationScoped
public class UserRepository implements PanacheRepository<User> {
  @Inject Logger logger;

  public User findByUserName(String userName) {
    logger.debug("Querying user by name: " + userName);
    return find("userName", userName).firstResult();
  }
}

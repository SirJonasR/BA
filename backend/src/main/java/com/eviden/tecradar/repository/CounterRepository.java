package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Counter;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import org.jboss.logging.Logger;

/** repository for Counter entity. */
@ApplicationScoped
public class CounterRepository implements PanacheRepository<Counter> {
  @Inject Logger logger;

  /**
   * Find {@link Counter} entities.
   *
   * @param technology the technology of the counter
   * @param user the user of the counter
   * @return The Counter if found, otherwise null.
   */
  public Counter findByTechnologyAndUser(Technology technology, User user) {
    logger.debug(
        "Querying counter by technology: " + technology.getName() + " and user: " + user.getId());
    return find(
            "user = :user and technology = :technology",
            Parameters.with("user", user).and("technology", technology))
        .firstResult();
  }

  /**
   * Find all {@link Counter} entities with given technology.
   *
   * @param technology the technology of all counters
   * @return A list of {@link Counter} entities.
   */
  public List<Counter> findByTechnology(Technology technology) {
    logger.debug("Querying counters by technology: " + technology.getName());
    return find("technology = :technology", Parameters.with("technology", technology)).list();
  }
}

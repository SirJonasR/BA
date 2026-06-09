package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Industry;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/** Repository for performing database operations on {@link Industry} entities. */
@ApplicationScoped
public class IndustryRepository implements PanacheRepository<Industry> {
  @Inject Logger logger;

  /**
   * Find a {@link Industry} entity by its name, case-insensitively.
   *
   * @param name The name of the Project.
   * @return The Industry entity if found, null otherwise.
   */
  public Industry findByNameIgnoreCase(String name) {
    logger.debug("Querying industry by name: " + name);
    return find("LOWER(name) = LOWER(?1)", name).firstResult();
  }
}

package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Technology;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/** Repository for technology entity. */
@ApplicationScoped
public class TechnologyRepository implements PanacheRepository<Technology> {
  @Inject Logger logger;

  /**
   * Finds a {@link Technology} entity by its name, case-insensitively.
   *
   * @param name The name of the Technology.
   * @return The Technology entity if found, null otherwise.
   */
  public Technology findByNameIgnoreCase(String name) {
    logger.debug("Querying technology by name: " + name);
    return find("LOWER(name) = LOWER(?1)", name).firstResult();
  }
}

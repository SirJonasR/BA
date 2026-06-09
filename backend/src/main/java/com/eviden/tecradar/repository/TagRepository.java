package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Tag;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/** Repository for performing database operations on {@link Tag} entities. */
@ApplicationScoped
public class TagRepository implements PanacheRepository<Tag> {
  @Inject Logger logger;

  /**
   * Finds a {@link Tag} entity by its name.
   *
   * @param name The name of the tag.
   * @return The Tag entity if found, null otherwise.
   */
  public Tag findByName(String name) {
    logger.debug("Querying tag by name: " + name);
    return find("name", name).firstResult();
  }
}

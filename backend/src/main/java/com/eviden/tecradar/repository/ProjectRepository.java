package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Project;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/** Repository for performing database operations on {@link Project} entities. */
@ApplicationScoped
public class ProjectRepository implements PanacheRepository<Project> {
  @Inject Logger logger;

  /**
   * Find a {@link Project} entity by its name, case-insensitively.
   *
   * @param name The name of the Project.
   * @return The Project entity if found, null otherwise.
   */
  public Project findByNameIgnoreCase(String name) {
    logger.debug("Querying project by name: " + name);
    return find("LOWER(name) = LOWER(?1)", name).firstResult();
  }
}

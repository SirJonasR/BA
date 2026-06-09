package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Certificate;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import org.jboss.logging.Logger;

/**
 * Repository for performing database operations on {@link com.eviden.tecradar.entity.Certificate}
 * entities.
 */
@ApplicationScoped
public class CertificateRepository implements PanacheRepository<Certificate> {
  @Inject Logger logger;

  /**
   * Find all {@link Certificate} entities with given name.
   *
   * @param name the technology of all counters
   * @return A list of {@link Certificate} entities.
   */
  public Certificate findByName(String name) {
    logger.debug("Querying certificate by name: " + name);
    return find("name", name).firstResult();
  }

  public List<Certificate> findByFollowUp(Certificate certificate) {
    return find("SELECT c FROM Certificate c JOIN c.followUps f WHERE f = ?1", certificate).list();
  }

  public List<Certificate> findByPrerequisites(Certificate certificate) {
    return find("SELECT c FROM Certificate c JOIN c.prerequisites p WHERE p = ?1", certificate)
        .list();
  }
}

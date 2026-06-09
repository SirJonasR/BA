package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Customer;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

/** Repository for performing database operations on {@link Customer} entities. */
@ApplicationScoped
public class CustomerRepository implements PanacheRepository<Customer> {
  @Inject Logger logger;

  /**
   * Finds all {@link Customer} entity by its name.
   *
   * @param name The name of the customer.
   * @return The Customer entity if found, null otherwise.
   */
  public Customer findByName(String name) {
    logger.debug("Querying customer by name: " + name);
    return find("name", name).firstResult();
  }
}

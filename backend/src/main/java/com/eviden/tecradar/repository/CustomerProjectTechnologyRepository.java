package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Customer;
import com.eviden.tecradar.entity.CustomerProjectTechnology;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for performing database operations on {@link Customer} entities. */
@ApplicationScoped
public class CustomerProjectTechnologyRepository
    implements PanacheRepository<CustomerProjectTechnology> {}

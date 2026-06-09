package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.CustomerProject;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for performing database operations on {@link CustomerProject} entities. */
@ApplicationScoped
public class CustomerProjectRepository implements PanacheRepository<CustomerProject> {}

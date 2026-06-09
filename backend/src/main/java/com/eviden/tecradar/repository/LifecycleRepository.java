package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Lifecycle;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for lifecycle entity. */
@ApplicationScoped
public class LifecycleRepository implements PanacheRepository<Lifecycle> {}

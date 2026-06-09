package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.ProjectHistory;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for performing database operations on {@link ProjectHistory} entities. */
@ApplicationScoped
public class ProjectHistoryRepository implements PanacheRepository<ProjectHistory> {}

package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.Category;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

/** Repository for category entity. */
@ApplicationScoped
public class CategoryRepository implements PanacheRepository<Category> {}

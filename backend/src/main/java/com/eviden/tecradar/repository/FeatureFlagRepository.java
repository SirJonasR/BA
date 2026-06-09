package com.eviden.tecradar.repository;

import com.eviden.tecradar.entity.FeatureFlag;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.Optional;

@ApplicationScoped
public class FeatureFlagRepository implements PanacheRepository<FeatureFlag> {

  public Optional<FeatureFlag> findByName(String name) {
    return find("name", name).firstResultOptional();
  }
}

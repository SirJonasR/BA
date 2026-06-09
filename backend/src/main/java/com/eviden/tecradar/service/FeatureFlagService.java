package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.FeatureFlag;
import com.eviden.tecradar.repository.FeatureFlagRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class FeatureFlagService {

  @Inject FeatureFlagRepository featureFlagRepository;

  public List<FeatureFlag> getAllFeatureFlags() {
    return featureFlagRepository.listAll();
  }

  public Optional<FeatureFlag> getFeatureFlag(String name) {
    return featureFlagRepository.findByName(name);
  }

  public boolean isFeatureEnabled(String name) {
    return getFeatureFlag(name).map(flag -> flag.enabled).orElse(false);
  }

  @Transactional
  public FeatureFlag updateFeatureFlag(String name, boolean enabled) {
    FeatureFlag flag =
        featureFlagRepository
            .findByName(name)
            .orElseThrow(() -> new NotFoundException("Feature flag not found: " + name));
    flag.setEnabled(enabled);
    featureFlagRepository.persist(flag);
    return flag;
  }
}

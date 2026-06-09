package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Industry;
import com.eviden.tecradar.repository.IndustryRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/** Service for {@link Industry} related tasks. */
@ApplicationScoped
public class IndustryService {
  @Inject IndustryRepository industryRepository;
  @Inject Logger logger;

  /**
   * Get a list of all Industries from the database.
   *
   * @return a list of all industries alphabetically sorted.
   */
  public List<Industry> getAll() {
    return industryRepository.listAll().stream()
        .sorted(Comparator.comparing(industry -> industry.getName().toLowerCase()))
        .collect(Collectors.toList());
  }
}

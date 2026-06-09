package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Lifecycle;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.LifecycleRepository;
import io.quarkus.cache.CacheResult;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

/** Service for lifecycle related tasks. */
@ApplicationScoped
public class LifecycleService {

  @Inject LifecycleRepository lifecycleRepository;

  /**
   * Provide a list with all lifecycles.
   *
   * @return list of lifecycles
   */
  @CacheResult(cacheName = "lifecycles")
  public List<Lifecycle> getAll() {
    return lifecycleRepository.listAll(Sort.by("sort", Sort.Direction.Ascending));
  }

  /**
   * Provide a lifecycle for a given id.
   *
   * @param id lifecycle identifier
   * @return lifecycle
   * @throws ResourceNotFoundException if lifecycle does not exist
   */
  public Lifecycle get(Long id) throws ResourceNotFoundException {
    Lifecycle lifecycle = getInternal(id);
    if (lifecycle == null) {
      throw new ResourceNotFoundException("No lifecycle found for id = " + id);
    }
    return lifecycle;
  }

  @CacheResult(cacheName = "lifecycles")
  protected Lifecycle getInternal(Long id) {
    return lifecycleRepository.findById(id);
  }
}

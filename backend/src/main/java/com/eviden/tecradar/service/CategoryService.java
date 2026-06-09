package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.repository.CategoryRepository;
import io.quarkus.cache.CacheResult;
import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

/** Service for category related tasks. */
@ApplicationScoped
public class CategoryService {

  @Inject CategoryRepository categoryRepository;

  /**
   * Provide a list with all categories.
   *
   * @return list of categories
   */
  @CacheResult(cacheName = "categories")
  public List<Category> getAll() {
    return categoryRepository.listAll(Sort.by("id"));
  }

  /**
   * Provide a category for a given id.
   *
   * @param id category identifier
   * @return category
   * @throws ResourceNotFoundException if category does not exist
   */
  public Category get(Long id) throws ResourceNotFoundException {
    Category category = getInternal(id);
    if (category == null) {
      throw new ResourceNotFoundException("No category found for id = " + id);
    }
    return category;
  }

  @CacheResult(cacheName = "categories")
  protected Category getInternal(Long id) {
    return categoryRepository.findById(id);
  }
}

package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Category;
import com.eviden.tecradar.service.CategoryService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Resource for performing CRUD operations on {@link Category} entities. */
@Path("/category")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class CategoryResource {
  @Inject CategoryService categoryService;

  @GET
  public List<Category> getAll() {
    return categoryService.getAll();
  }
}

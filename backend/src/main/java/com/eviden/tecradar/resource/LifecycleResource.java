package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Lifecycle;
import com.eviden.tecradar.service.LifecycleService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Controller for the lifecycle REST endpoint. */
@Path("/lifecycle")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class LifecycleResource {
  @Inject LifecycleService lifecycleService;

  /**
   * Get a list with all lifecycles.
   *
   * @return list of lifecycle
   */
  @GET
  public List<Lifecycle> getAll() {
    return lifecycleService.getAll();
  }
}

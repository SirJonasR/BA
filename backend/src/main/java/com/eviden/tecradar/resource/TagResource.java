package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Tag;
import com.eviden.tecradar.service.TagService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Resource for performing CRUD operations on {@link Tag} entities. */
@Path("/tag")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class TagResource {
  @Inject TagService tagService;

  /**
   * Returns all the available tags.
   *
   * @return list of all tags.
   */
  @GET
  public List<String> getAll() {
    return tagService.getAll();
  }
}

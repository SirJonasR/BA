package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Industry;
import com.eviden.tecradar.service.IndustryService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import org.jboss.logging.Logger;

/** Resource for performing CRUD operations on {@link Industry} entities. */
@Path("/industries")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
@Authenticated
public class IndustryResource {
  @Inject IndustryService industryService;
  @Inject Logger logger;

  @GET
  public List<Industry> getAll() {
    return industryService.getAll();
  }
}

package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.History;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.service.HistoryService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Resource for performing CRUD operations on {@link History} entities. */
@Path("/history")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class HistoryResource {
  @Inject HistoryService historyService;

  /**
   * Return a list of histories for given technology id.
   *
   * @param technologyId technology identifier.
   * @return a list of histories.
   * @throws NotFoundException if for given id does not a technology exists.
   */
  @GET
  @Path("{technology-id}")
  public List<History> get(@PathParam("technology-id") Long technologyId) {
    try {
      return historyService.getHistoryForTechnology(technologyId);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException(
          "No history found for technology with Id = " + technologyId);
    }
  }
}

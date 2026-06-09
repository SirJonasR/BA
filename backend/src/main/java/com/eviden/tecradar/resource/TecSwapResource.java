package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.TecSwapElement;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.TecSwapDto;
import com.eviden.tecradar.service.TecSwapService;
import com.eviden.tecradar.service.UserService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Controller for the tec_swap REST endpoint. */
@Path("/tec_swap")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class TecSwapResource {

  @Inject TecSwapService tecSwapService;
  @Inject SecurityIdentity securityIdentity;
  @Inject UserService userService;

  /**
   * Get a list of all TecSwapElements.
   *
   * @return a list of all TecSwapElements.
   */
  @GET
  public List<TecSwapElement> getAll() {
    String username = securityIdentity.getPrincipal().getName();
    User user = userService.findOrCreate(username);
    if (user.hasRole(RoleName.TECSWAP)) {
      return tecSwapService.getAll();
    } else {
      throw new ForbiddenException();
    }
  }

  /**
   * Update an existing tec_swap_element entry in the database. Returns HTTP status 404 if given
   * tec_swap_element does not exist.
   *
   * @param id tec_swap identifier
   * @param tecSwapDto necessary information to update an entry.
   * @return the updated tec_swap_element.
   * @throws NotFoundException if given tec_swap_element does not exist.
   */
  @PUT
  @Consumes(MediaType.APPLICATION_JSON)
  @Path("{id}")
  public TecSwapElement update(@PathParam("id") Long id, TecSwapDto tecSwapDto) {
    String username = securityIdentity.getPrincipal().getName();
    User user = userService.findOrCreate(username);
    if (user.hasRole(RoleName.TECSWAP)) {
      try {
        return tecSwapService.update(id, tecSwapDto);
      } catch (ResourceNotFoundException ex) {
        throw new NotFoundException();
      }
    } else {
      throw new ForbiddenException();
    }
  }
}

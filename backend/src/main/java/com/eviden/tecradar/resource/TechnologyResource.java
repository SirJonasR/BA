package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.Technology;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.TechnologyDto;
import com.eviden.tecradar.service.TechnologyService;
import com.eviden.tecradar.service.UserService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

/** Controller for the technology REST endpoint. */
@Path("/technology")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class TechnologyResource {
  @Inject Logger logger;
  @Inject TechnologyService technologyService;
  @Inject SecurityIdentity securityIdentity;
  @Inject UserService userService;

  /**
   * Get a list with all technologies.
   *
   * @return list of technologies
   */
  @GET
  public List<TechnologyDto> getAll() {
    return technologyService.getAll().stream()
        .map(TechnologyDto::fromEntity)
        .collect(Collectors.toList());
  }

  /**
   * Get technology for a given id. Return HTTP status 404, if technology does not exist
   *
   * @param id technology identifier
   * @return technology
   * @throws NotFoundException if technology does not exist.
   */
  @GET
  @Path("{id}")
  public TechnologyDto get(@PathParam("id") Long id) {
    try {
      Technology technology = technologyService.get(id);
      return TechnologyDto.fromEntity(technology);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Technology with Id " + id + " not found.");
    }
  }

  /**
   * Create a new technology entry in the database. In addition, a history entry will be created
   * too. Returns HTTP status 404 if given category or lifecycle does not exist.
   *
   * @param technologyRequestForm necessary information for a new technology entry
   * @return the newly created technology
   * @throws NotFoundException if the given category or lifecycle does not exist.
   */
  @POST
  @Transactional
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public TechnologyDto create(TechnologyRequestForm technologyRequestForm) {
    String userName = securityIdentity.getPrincipal().getName();
    try {
      Technology technology = technologyService.create(technologyRequestForm, userName);
      return TechnologyDto.fromEntity(technology);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Technology with user " + userName + " not created.");
    }
  }

  /**
   * Update an existing technology entry in the database. In addition, a history entry will be
   * created too. Returns HTTP status 404 if given technology, category or lifecycle does not exist
   *
   * @param id technology identifier
   * @param technologyRequestForm necessary information to update a technology entry
   * @return the updated technology
   * @throws NotFoundException if given technology, category or lifecycle does not exist
   */
  @PUT
  @Path("{id}")
  @Transactional
  @Consumes(MediaType.MULTIPART_FORM_DATA)
  public TechnologyDto update(
      @PathParam("id") Long id, TechnologyRequestForm technologyRequestForm) {
    String userName = securityIdentity.getPrincipal().getName();
    try {
      Technology technology = technologyService.update(id, technologyRequestForm, userName);
      return TechnologyDto.fromEntity(technology);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Technology with Id " + id + " not updated.");
    }
  }

  /**
   * Delete a given technology entry including all related entries. Returns HTTP status 404 if
   * technology does not exist.
   *
   * @param id technology identifier.
   * @throws NotFoundException if given technology, category or lifecycle does not exist.
   */
  @DELETE
  @Path("{id}")
  @Transactional
  public void delete(@PathParam("id") Long id) {
    String username = securityIdentity.getPrincipal().getName();
    if (userService.findOrCreate(username).hasRole(RoleName.ADMIN)) {
      try {
        logger.info("User " + username + " deletes technology with Id " + id);
        technologyService.delete(id);
      } catch (ResourceNotFoundException ex) {
        throw new ResourceNotFoundException("Technology with Id " + id + " not found.");
      }
    } else {
      logger.warn("No permission to delete");
      throw new ForbiddenException();
    }
  }

  /**
   * Increments the number of view.
   *
   * @param id technology identifier
   */
  @GET
  @Path("count/{id}")
  @Transactional
  public Response incrementVisitCounter(@PathParam("id") Long id) {
    String userName = securityIdentity.getPrincipal().getName();
    try {
      technologyService.incrementVisitCounter(id, userName);
      return Response.ok().build();
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("Technology with Id " + id + " not found.");
    }
  }
}

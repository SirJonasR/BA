package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.CommentDto;
import com.eviden.tecradar.service.CommentService;
import com.eviden.tecradar.service.TechnologyService;
import com.eviden.tecradar.service.UserService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import org.jboss.logging.Logger;

/** Controller for the comment REST endpoint. */
@Path("/comments")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class CommentResource {
  private static final Logger LOG = Logger.getLogger(TechnologyResource.class);
  @Inject TechnologyService technologyService;
  @Inject SecurityIdentity securityIdentity;
  @Inject UserService userService;
  @Inject CommentService commentService;

  /**
   * Gets the comments for a specific TecSwapElement.
   *
   * @param id the ID of the TecSwapElement
   * @return a list of CommentDto objects
   */
  @GET
  @Path("{id}")
  public List<CommentDto> getComments(@PathParam("id") Long id) {
    String username = securityIdentity.getPrincipal().getName();
    User user = userService.findOrCreate(username);
    if (!user.hasRole(RoleName.TECSWAP)) {
      throw new ForbiddenException();
    }
    try {
      return commentService.getComments(id, user);
    } catch (ResourceNotFoundException ex) {
      LOG.warn(ex.getMessage());
      throw new NotFoundException();
    }
  }

  /**
   * Posts a comment for a specific TecSwapElement.
   *
   * @param id the ID of the TecSwapElement
   * @param request the request containing the comment details
   * @return a Response indicating the result of the operation
   */
  @POST
  @Path("{id}")
  public Response postComment(@PathParam("id") Long id, CommentPostRequest request) {
    String username = securityIdentity.getPrincipal().getName();
    User user = userService.findOrCreate(username);
    if (!user.hasRole(RoleName.TECSWAP)) {
      throw new ForbiddenException();
    }
    try {
      commentService.postComment(id, request, user);
      return Response.ok().build();
    } catch (ResourceNotFoundException ex) {
      LOG.warn(ex.getMessage());
      throw new NotFoundException();
    }
  }
}

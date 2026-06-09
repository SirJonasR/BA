package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.Project;
import com.eviden.tecradar.entity.ProjectHistory;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.ProjectDto;
import com.eviden.tecradar.service.ProjectHistoryService;
import com.eviden.tecradar.service.ProjectService;
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
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Resource for performing CRUD operations on {@link Project} entities. */
@Path("/project")
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class ProjectResource {
  private static final Logger log = LoggerFactory.getLogger(ProjectResource.class);
  @Inject ProjectService projectService;
  @Inject ProjectHistoryService projectHistoryService;
  @Inject SecurityIdentity securityIdentity;
  @Inject UserService userService;

  @GET
  public List<Project> getAll() {
    return projectService.getAll();
  }

  /**
   * Get project for given id. Return HTTP status 404, if project does not exist.
   *
   * @param id project identifier
   * @return project
   * @throws NotFoundException if project does not exist.
   */
  @GET
  @Path("{id}")
  public Project get(@PathParam("id") Long id) {
    try {
      return projectService.get(id);
    } catch (ResourceNotFoundException ex) {
      throw new ResourceNotFoundException("No project found with Id = " + id);
    }
  }

  @POST
  @Transactional
  @Consumes(MediaType.APPLICATION_JSON)
  public Project create(ProjectDto project) {
    String userName = securityIdentity.getPrincipal().getName();
    return projectService.create(project, userName);
  }

  @PUT
  @Path("{id}")
  @Transactional
  @Consumes(MediaType.APPLICATION_JSON)
  public Project update(@PathParam("id") Long id, ProjectDto project) {
    String userName = securityIdentity.getPrincipal().getName();
    return projectService.update(id, project, userName);
  }

  /**
   * Deletes a given project entry. Returns HTTP status 404 if project does not exist.
   *
   * @param id project identifier.
   * @throws NotFoundException if given project does not exist.
   * @throws ForbiddenException if user is not authorized to delete project.
   */
  @DELETE
  @Path("{id}")
  @Transactional
  public void delete(@PathParam("id") Long id) {
    String username = securityIdentity.getPrincipal().getName();
    if (userService.findOrCreate(username).hasRole(RoleName.ADMIN)) {
      try {
        log.info("User " + username + " deletes project with id " + id);
        projectService.delete(id);
      } catch (ResourceNotFoundException ex) {
        throw new ResourceNotFoundException("No project found with Id = " + id);
      }
    } else {
      throw new ForbiddenException();
    }
  }

  @GET
  @Path("history/{projectId}")
  public List<ProjectHistory> getProjectHistory(@PathParam("projectId") long projectId) {
    String userName = securityIdentity.getPrincipal().getName();
    return projectHistoryService.getHistoryForProject(projectId, userName);
  }
}

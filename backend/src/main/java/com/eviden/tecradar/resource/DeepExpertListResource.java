package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.DeepExpertListEntry;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.model.UpdateDeepExpertListEntryDto;
import com.eviden.tecradar.service.DeepExpertService;
import com.eviden.tecradar.service.UserService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Path("/deep-experts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class DeepExpertListResource {

  private static final Logger log = LoggerFactory.getLogger(DeepExpertListResource.class);
  @Inject DeepExpertService deepExpertService;
  @Inject UserService userService;
  @Inject SecurityIdentity securityIdentity;

  @PUT
  @Transactional
  public void updateDeepExpertList(@NotNull @Valid List<UpdateDeepExpertListEntryDto> newList) {
    String username = securityIdentity.getPrincipal().getName();
    User user = userService.findOrCreate(username);
    if (!user.hasRole(RoleName.ADMIN)) {
      throw new ForbiddenException();
    }
    log.info("Updating deep expert list");
    // Convert DTOs to entity objects
    List<DeepExpertListEntry> entries =
        newList.stream()
            .map(
                dto -> {
                  DeepExpertListEntry entry = new DeepExpertListEntry();
                  entry.setTechnologyName(dto.technologyName);
                  entry.setComment(dto.comment);
                  entry.setListIndex(dto.tableRow);
                  entry.setExpertInformation(dto.expertInformation);
                  entry.setScope(dto.scope);
                  entry.setDescription(dto.description);
                  return entry;
                })
            .toList();
    deepExpertService.updateDeepExpertList(entries);
  }

  @GET
  @Path("/{technologyId}")
  public List<DeepExpertListEntry> getDeepExpertForTechnology(
      @PathParam("technologyId") long technologyId) {
    return deepExpertService.getDeepExpertForTechnology(technologyId);
  }

  @GET
  public List<DeepExpertListEntry> getDeepExpertList() {
    return deepExpertService.getDeepExpertList();
  }
}

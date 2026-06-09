package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.FeatureFlag;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.service.FeatureFlagService;
import com.eviden.tecradar.service.UserService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/feature-flags")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class FeatureFlagResource {

  @Inject FeatureFlagService featureFlagService;
  @Inject UserService userService;
  @Inject SecurityIdentity securityIdentity;

  @GET
  public List<FeatureFlag> getAllFeatureFlags() {
    return featureFlagService.getAllFeatureFlags();
  }

  @PUT
  @Path("/{name}")
  public Response updateFeatureFlag(@PathParam("name") String name, FeatureFlagUpdateDto dto) {
    String username = securityIdentity.getPrincipal().getName();
    User user = userService.findOrCreate(username);
    if (!user.hasRole(RoleName.ADMIN)) {
      throw new ForbiddenException();
    }
    FeatureFlag updatedFlag = featureFlagService.updateFeatureFlag(name, dto.isEnabled());
    return Response.ok(updatedFlag).build();
  }

  public static class FeatureFlagUpdateDto {
    private boolean enabled;

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }
  }
}

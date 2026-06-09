package com.eviden.tecradar.resource;

import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.model.ThemeId;
import com.eviden.tecradar.model.ThemePreferenceDto;
import com.eviden.tecradar.model.UserSettingsDto;
import com.eviden.tecradar.service.UserService;
import com.eviden.tecradar.service.UsernameResolver;
import io.quarkiverse.bucket4j.runtime.RateLimited;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import java.util.List;

/** Resource for performing CRUD operations on {@link User} entities. */
@Path("/user")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@RateLimited(bucket = "default", identityResolver = UsernameResolver.class)
public class UserResource {

  @Inject SecurityIdentity securityIdentity;

  @Inject UserService userService;

  /**
   * Gets the user.
   *
   * @return user
   */
  @GET
  @Path("/me")
  @Transactional
  public User me() {
    String userName = securityIdentity.getPrincipal().getName();
    return userService.findOrCreate(userName);
  }

  /**
   * Retrieves a list of all users.
   *
   * <p>Only users with the ADMIN role are authorized to access this endpoint. If the current user
   * does not have the ADMIN role, a ForbiddenException is thrown.
   *
   * @return a list of all users
   * @throws ForbiddenException if the current user is not an ADMIN
   */
  @GET
  public List<User> getAll() {
    String userName = securityIdentity.getPrincipal().getName();
    User user = userService.get(userName);
    if (!user.hasRole(RoleName.ADMIN)) {
      throw new ForbiddenException();
    } else {
      return userService.getAll();
    }
  }

  /**
   * Updates the specified user.
   *
   * <p>Only users with the ADMIN role are authorized to update user information. The user
   * performing the update is determined from the security context. If the current user does not
   * have the ADMIN role, a ForbiddenException is thrown.
   *
   * @param user the user entity with updated information
   * @return the updated user entity
   * @throws ForbiddenException if the current user is not an ADMIN
   */
  @PUT
  @Transactional
  @Consumes(MediaType.APPLICATION_JSON)
  public User updateUser(User user) {
    String changedBy = securityIdentity.getPrincipal().getName();
    User changedByUser = userService.get(changedBy);

    if (!changedByUser.hasRole(RoleName.ADMIN)) {
      throw new ForbiddenException();
    } else {
      return userService.updateUser(user, changedByUser);
    }
  }

  /**
   * Get the theme preference for the current user.
   *
   * @return ThemePreferenceDto containing the current theme preference
   */
  @GET
  @Path("/me/theme")
  public ThemePreferenceDto getThemePreference() {
    String userName = securityIdentity.getPrincipal().getName();
    ThemeId themePreference = userService.getThemePreference(userName);
    return new ThemePreferenceDto(themePreference);
  }

  /**
   * Update the theme preference for the current user.
   *
   * @param themePreferenceDto DTO containing the new theme preference
   * @return ThemePreferenceDto containing the updated theme preference
   */
  @PUT
  @Path("/me/theme")
  @Transactional
  @Consumes(MediaType.APPLICATION_JSON)
  public ThemePreferenceDto updateThemePreference(@Valid ThemePreferenceDto themePreferenceDto) {
    String userName = securityIdentity.getPrincipal().getName();
    userService.updateThemePreference(userName, themePreferenceDto.getThemePreference());
    return themePreferenceDto;
  }

  /**
   * Update user settings for the current user.
   *
   * @param settingsDto DTO containing the new settings
   * @return UserSettingsDto containing the updated settings
   */
  @PUT
  @Path("/settings")
  @Transactional
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public UserSettingsDto updateUserSettings(UserSettingsDto settingsDto) {
    String currentUserName = securityIdentity.getPrincipal().getName();
    User currentUser = userService.get(currentUserName);
    return userService.updateUserSettings(currentUser, settingsDto);
  }
}

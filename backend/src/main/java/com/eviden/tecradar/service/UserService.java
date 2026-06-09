package com.eviden.tecradar.service;

import com.eviden.tecradar.entity.RoleAction;
import com.eviden.tecradar.entity.RoleAssignmentLog;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.ThemeId;
import com.eviden.tecradar.model.UserSettingsDto;
import com.eviden.tecradar.repository.RoleAssignmentLogRepository;
import com.eviden.tecradar.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;
import org.slf4j.LoggerFactory;

/** Service for user related tasks. */
@ApplicationScoped
public class UserService {

  private static final org.slf4j.Logger log = LoggerFactory.getLogger(UserService.class);
  @Inject UserRepository userRepository;
  @Inject RoleAssignmentLogRepository roleAssignmentLogRepository;
  @Inject Logger logger;

  /**
   * Provide user for a given username. If no entry exists, create a new one.
   *
   * @param username user identifier
   * @return existing or newly created user
   */
  @Transactional
  public User findOrCreate(String username) {
    User user = userRepository.findByUserName(username);

    if (user == null) {
      user = new User();
      user.setUserName(username);
      user.addRole(RoleName.USER);
      // Default settings for new users
      user.updateUserDisplay(false, true);
      logger.info("User with name " + username + " created");
      userRepository.persistAndFlush(user);
    }

    return user;
  }

  /**
   * Provide user for a given username.
   *
   * @param username user identifier
   * @return user
   * @throws ResourceNotFoundException if user does not exist
   */
  public User get(String username) throws ResourceNotFoundException {
    User user = userRepository.findByUserName(username);
    if (user == null) {
      throw new ResourceNotFoundException("No user found for name = " + username);
    }
    return user;
  }

  /**
   * Provides a list of all user.
   *
   * @return a list of user.
   */
  public List<User> getAll() {
    return userRepository.listAll().stream()
        .sorted(Comparator.comparing(user -> user.getUserName().toLowerCase()))
        .collect(Collectors.toList());
  }

  /**
   * Updates an existing user with a new one.
   *
   * @param updatedUser the new data for the user.
   * @return updated user.
   */
  @Transactional
  public User updateUser(User updatedUser, User changedBy) {
    User currentUser = get(updatedUser.getUserName());
    HashMap<RoleName, RoleAction> changedRoles = checkRolesChanged(currentUser, updatedUser);
    final boolean rolesChanged = !changedRoles.isEmpty();
    currentUser.setAllRoles(updatedUser.getRoles());
    currentUser.updateUserDisplay(updatedUser.getShowIconsInColor(), updatedUser.getShowIcons());
    userRepository.persistAndFlush(currentUser);

    // only log if roles have changed
    if (rolesChanged) {
      logRoleChanges(updatedUser, changedBy, changedRoles);
    }

    return currentUser;
  }

  /**
   * Logs changes made to user roles by recording the details in the RoleAssignmentLogRepository.
   * This method should be called whenever a user's roles are updated to ensure an audit trail is
   * maintained.
   *
   * @param updatedUser the user whose roles have changed
   * @param changedBy the identifier of the user or system that performed the role change
   * @param changedRoles a {@code HashMap<RoleName, RoleAction>} mapping each changed role to its
   *     corresponding action
   */
  private void logRoleChanges(
      User updatedUser, User changedBy, HashMap<RoleName, RoleAction> changedRoles) {
    // we need the persisted user object, otherwise there will be an hibernate error
    User persistedUpdatedUser = get(updatedUser.getUserName());

    // create db entry for every changed role
    for (RoleName changedRole : changedRoles.keySet()) {
      RoleAssignmentLog logEntry = new RoleAssignmentLog();
      logEntry.setUser(persistedUpdatedUser);
      logEntry.setRoleName(changedRole);
      logEntry.setRoleAction(changedRoles.get(changedRole));
      logEntry.setChangedByUser(changedBy);
      logEntry.setChangedAt(LocalDateTime.now());

      log.info(
          String.format(
              "User %s has changed roles of user %s (Role %s %s)",
              logEntry.getChangedByUser().getUserName(),
              logEntry.getUser().getUserName(),
              logEntry.getRoleName(),
              logEntry.getRoleAction().toString().toLowerCase()));

      // save in db
      roleAssignmentLogRepository.persist(logEntry);
    }

    // flush all new entries in db
    roleAssignmentLogRepository.flush();
  }

  /**
   * Compares the roles of the current and updated user to determine which roles have been added or
   * removed.
   *
   * <p>This method returns a map where each key is a {@link RoleName} that has changed, and the
   * value is a {@link RoleAction} indicating whether the role was {@code ADDED} or {@code REMOVED}.
   * It is useful for auditing and logging role changes during user updates.
   *
   * @param currentUser the existing user entity whose roles are being compared
   * @param updatedUser the user entity containing the new set of roles
   * @return a {@code HashMap<RoleName, RoleAction>} mapping each changed role to its corresponding
   *     action
   */
  private HashMap<RoleName, RoleAction> checkRolesChanged(User currentUser, User updatedUser) {
    List<RoleName> currentRoles = currentUser.getRoles();
    List<RoleName> newRoles = updatedUser.getRoles();
    HashMap<RoleName, RoleAction> changedRoles = new HashMap<RoleName, RoleAction>();

    // check if roles were removed
    for (RoleName roleName : currentRoles) {
      if (!newRoles.contains(roleName)) {
        changedRoles.put(roleName, RoleAction.REMOVED);
      }
    }

    // check if roles were added
    for (RoleName roleName : newRoles) {
      if (!currentRoles.contains(roleName)) {
        changedRoles.put(roleName, RoleAction.ADDED);
      }
    }

    return changedRoles;
  }

  /**
   * Update the theme preference for a user.
   *
   * @param username the username of the user
   * @param themePreference the new theme preference value
   * @return the updated user
   * @throws ResourceNotFoundException if user does not exist
   */
  @Transactional
  public User updateThemePreference(String username, ThemeId themePreference)
      throws ResourceNotFoundException {
    User user = get(username);
    user.setThemePreference(themePreference);
    userRepository.persistAndFlush(user);
    logger.info("Updated theme preference for user " + username + " to " + themePreference);
    return user;
  }

  /**
   * Get the theme preference for a user.
   *
   * @param username the username of the user
   * @return the theme preference
   * @throws ResourceNotFoundException if user does not exist
   */
  public ThemeId getThemePreference(String username) throws ResourceNotFoundException {
    User user = get(username);
    return user.getThemePreference();
  }

  /**
   * Update user settings (display preferences).
   *
   * @param user the user to update
   * @param settingsDto the new settings
   * @return the updated settings as DTO
   */
  public UserSettingsDto updateUserSettings(User user, UserSettingsDto settingsDto) {
    user.updateSettings(settingsDto);
    userRepository.persistAndFlush(user);
    logger.info("Updated display settings for user: " + user.getUserName());
    return user.getUserSettingsDto();
  }
}

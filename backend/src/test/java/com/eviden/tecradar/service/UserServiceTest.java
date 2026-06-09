package com.eviden.tecradar.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.eviden.tecradar.entity.RoleAssignmentLog;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.UserSettingsDto;
import com.eviden.tecradar.repository.RoleAssignmentLogRepository;
import com.eviden.tecradar.repository.UserRepository;
import java.util.Arrays;
import java.util.List;
import org.jboss.logging.Logger;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

  @Mock private UserRepository userRepository;

  @Mock private RoleAssignmentLogRepository roleAssignmentLogRepository;

  @Mock private Logger logger;

  @InjectMocks private UserService userService;

  private User testUser;
  private User changedByUser;

  @BeforeEach
  void setUp() {
    testUser = new User();
    testUser.setUserName("luke");
    testUser.addRole(RoleName.USER);

    changedByUser = new User();
    changedByUser.setUserName("admin");
    changedByUser.addRole(RoleName.USER);
  }

  @Test
  void testGetForExistingUser() {
    String username = "luke";
    when(userRepository.findByUserName(username)).thenReturn(testUser);

    User user = userService.get(username);

    Assertions.assertEquals(username, user.getUserName());
    verify(userRepository).findByUserName(username);
  }

  @Test
  void testGetForNonExistingUser() {
    String username = "NonExistent";
    when(userRepository.findByUserName(username)).thenReturn(null);

    ResourceNotFoundException expectedException =
        Assertions.assertThrows(ResourceNotFoundException.class, () -> userService.get(username));

    Assertions.assertTrue(expectedException.getMessage().contains("No user found for name"));
    verify(userRepository).findByUserName(username);
  }

  @Test
  void testFindOrCreateForExistingUser() {
    String username = "luke";
    when(userRepository.findByUserName(username)).thenReturn(testUser);

    User user = userService.findOrCreate(username);

    Assertions.assertEquals(username, user.getUserName());
    verify(userRepository).findByUserName(username);
    verify(userRepository, never()).persistAndFlush(any(User.class));
  }

  @Test
  void testFindOrCreateForNonexistentUser() {
    String username = "newUser";
    when(userRepository.findByUserName(username)).thenReturn(null);

    User user = userService.findOrCreate(username);

    Assertions.assertEquals(username, user.getUserName());
    Assertions.assertTrue(user.getRoles().contains(RoleName.USER));
    verify(userRepository).findByUserName(username);
    verify(userRepository).persistAndFlush(any(User.class));
    verify(logger).info("User with name " + username + " created");
  }

  @Test
  void testUpdateUserWithColourDisplay() {
    String username = "luke";
    User updatedUser = new User();
    updatedUser.setUserName(username);
    updatedUser.addRole(RoleName.USER);
    updatedUser.updateUserDisplay(true, false);

    when(userRepository.findByUserName(username)).thenReturn(testUser);

    User result = userService.updateUser(updatedUser, changedByUser);

    Assertions.assertTrue(result.getShowIconsInColor());
    verify(userRepository).findByUserName(username);
    verify(userRepository).persistAndFlush(testUser);
  }

  @Test
  void testUpdateUserWithIconDisplay() {
    String username = "luke";
    User updatedUser = new User();
    updatedUser.setUserName(username);
    updatedUser.addRole(RoleName.USER);
    updatedUser.updateUserDisplay(false, true);

    when(userRepository.findByUserName(username)).thenReturn(testUser);

    User result = userService.updateUser(updatedUser, changedByUser);

    Assertions.assertTrue(result.getShowIcons());
    verify(userRepository).findByUserName(username);
    verify(userRepository).persistAndFlush(testUser);
  }

  @Test
  void testGetAll() {
    User user1 = new User();
    user1.setUserName("alice");
    User user2 = new User();
    user2.setUserName("bob");
    User user3 = new User();
    user3.setUserName("charlie");

    List<User> mockUsers = Arrays.asList(user3, user1, user2); // unsorted order
    when(userRepository.listAll()).thenReturn(mockUsers);

    List<User> users = userService.getAll();

    Assertions.assertEquals(3, users.size());
    // Verify they are sorted by username (case-insensitive)
    Assertions.assertEquals("alice", users.get(0).getUserName());
    Assertions.assertEquals("bob", users.get(1).getUserName());
    Assertions.assertEquals("charlie", users.get(2).getUserName());
    verify(userRepository).listAll();
  }

  @Test
  void testRoleAssignmentLogOnUpdatingUser() {
    String changedByUserName = "luke";
    String userName = "leia";

    User currentUser = new User();
    currentUser.setUserName(userName);
    currentUser.addRole(RoleName.USER);

    User updatedUser = new User();
    updatedUser.setUserName(userName);
    updatedUser.addRole(RoleName.USER);
    updatedUser.addRole(RoleName.TECSWAP);

    User persistedUser = new User();
    persistedUser.setUserName(userName);
    persistedUser.addRole(RoleName.USER);
    persistedUser.addRole(RoleName.TECSWAP);

    // Mock the repository calls
    when(userRepository.findByUserName(userName)).thenReturn(currentUser, persistedUser);

    User result = userService.updateUser(updatedUser, changedByUser);

    Assertions.assertNotNull(result);
    verify(userRepository, times(2)).findByUserName(userName); // once for update, once for logging
    verify(userRepository).persistAndFlush(currentUser);
    verify(roleAssignmentLogRepository).persist(any(RoleAssignmentLog.class));
    verify(roleAssignmentLogRepository).flush();
  }

  @Test
  void testUpdateUserSettings() {
    String username = "luke";
    UserSettingsDto settingsDto = new UserSettingsDto();
    settingsDto.setShowIconsInColor(true);
    settingsDto.setShowIcons(false);

    UserSettingsDto result = userService.updateUserSettings(testUser, settingsDto);

    Assertions.assertNotNull(result);
    verify(userRepository).persistAndFlush(testUser);
    verify(logger).info("Updated display settings for user: " + username);
  }

  @Test
  void testUpdateUserWithNoRoleChanges() {
    String username = "luke";
    User updatedUser = new User();
    updatedUser.setUserName(username);
    updatedUser.addRole(RoleName.USER); // Same role as existing user

    when(userRepository.findByUserName(username)).thenReturn(testUser);

    User result = userService.updateUser(updatedUser, changedByUser);

    Assertions.assertNotNull(result);
    verify(userRepository).findByUserName(username);
    verify(userRepository).persistAndFlush(testUser);
    // Should not log role changes since no roles changed
    verify(roleAssignmentLogRepository, never()).persist(any(RoleAssignmentLog.class));
    verify(roleAssignmentLogRepository, never()).flush();
  }

  @Test
  void testUpdateUserWithRoleRemoval() {
    String username = "luke";

    // Current user has both USER and TECSWAP roles
    User currentUser = new User();
    currentUser.setUserName(username);
    currentUser.addRole(RoleName.USER);
    currentUser.addRole(RoleName.TECSWAP);

    // Updated user only has USER role (TECSWAP removed)
    User updatedUser = new User();
    updatedUser.setUserName(username);
    updatedUser.addRole(RoleName.USER);

    User persistedUser = new User();
    persistedUser.setUserName(username);
    persistedUser.addRole(RoleName.USER);

    when(userRepository.findByUserName(username)).thenReturn(currentUser, persistedUser);

    User result = userService.updateUser(updatedUser, changedByUser);

    Assertions.assertNotNull(result);
    verify(userRepository, times(2)).findByUserName(username);
    verify(userRepository).persistAndFlush(currentUser);
    verify(roleAssignmentLogRepository).persist(any(RoleAssignmentLog.class));
    verify(roleAssignmentLogRepository).flush();
  }
}

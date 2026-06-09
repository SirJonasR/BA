package com.eviden.tecradar.entity;

import com.eviden.tecradar.service.UserService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for user entity, which are not already covered by other tests */
@QuarkusTest
class UserTest {
  @Inject UserService userService;

  @Test
  void testGetId() {
    User user = userService.get("luke");
    user.setId(123L);
    Assertions.assertEquals(123, user.getId());
  }

  @Test
  void testSetUserName() {
    User user = userService.get("luke");
    user.setUserName("newName");
    Assertions.assertEquals("newName", user.getUserName());
  }

  @Test
  void testSetColourDisplay() {
    User user = userService.get("luke");
    user.updateUserDisplay(true, false);
    Assertions.assertTrue(user.getShowIconsInColor());
    user.updateUserDisplay(false, false);
    Assertions.assertFalse(user.getShowIconsInColor());
  }

  @Test
  void testSetIconDisplay() {
    User user = userService.get("luke");
    user.updateUserDisplay(false, true);
    Assertions.assertTrue(user.getShowIcons());
    user.updateUserDisplay(false, false);
    Assertions.assertFalse(user.getShowIcons());
  }
}

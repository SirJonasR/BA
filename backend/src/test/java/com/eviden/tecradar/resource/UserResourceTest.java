package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.AuthenticationHelper;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.model.UserSettingsDto;
import com.eviden.tecradar.service.UserService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import java.util.List;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/** tests for user endpoint. */
@QuarkusTest
class UserResourceTest {
  @InjectMock UserService userServiceMock;

  /** test getting user content endpoint. */
  @Test
  void testGetUserContent() {
    String token = AuthenticationHelper.getToken("luke", "test");

    User mockUser = new User();
    mockUser.setUserName("luke");
    when(userServiceMock.findOrCreate("luke")).thenReturn(mockUser);

    Response response =
        given()
            .when()
            .header("Authorization", "Bearer " + token)
            .get("/user/me")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();

    JsonPath json = new JsonPath(response.asString());

    assertEquals("luke", json.getString("userName"));
  }

  @Test
  void testGetUserContentUnauthenticated() {
    given()
        .when()
        .get("/user/me")
        .then()
        .statusCode(HttpStatus.SC_UNAUTHORIZED)
        .extract()
        .response();
  }

  @Test
  void testPutUserContent() {
    // Mock the user being updated
    User mockUser = new User();
    mockUser.setUserName("yoda");
    mockUser.setAllRoles(List.of(RoleName.TECSWAP));
    mockUser.updateUserDisplay(false, false);

    // Mock the user making the change + get token for that user
    User mockChangedByUser = new User();
    mockChangedByUser.setUserName("luke");
    mockChangedByUser.setAllRoles(List.of(RoleName.ADMIN));
    String token = AuthenticationHelper.getToken("luke", "test");

    when(userServiceMock.get("luke")).thenReturn(mockChangedByUser);
    when(userServiceMock.updateUser(any(User.class), any(User.class))).thenReturn(mockUser);

    given()
        .when()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(mockUser)
        .put("/user")
        .then()
        .statusCode(HttpStatus.SC_OK)
        .extract()
        .response();

    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    ArgumentCaptor<User> changedByCaptor = ArgumentCaptor.forClass(User.class);

    verify(userServiceMock, times(1)).updateUser(userCaptor.capture(), changedByCaptor.capture());
    assertEquals("yoda", userCaptor.getValue().getUserName());
    assertEquals("luke", changedByCaptor.getValue().getUserName());
  }

  @Test
  void testGetAll() {
    String token = AuthenticationHelper.getToken("luke", "test");

    User mockAdminUser = new User();
    mockAdminUser.setUserName("luke");
    mockAdminUser.setAllRoles(List.of(RoleName.ADMIN));
    when(userServiceMock.get("luke")).thenReturn(mockAdminUser);

    User mockUser1 = new User();
    mockUser1.setUserName("user1");
    User mockUser2 = new User();
    mockUser2.setUserName("user2");
    when(userServiceMock.getAll()).thenReturn(List.of(mockUser1, mockUser2));

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/user")
        .then()
        .statusCode(HttpStatus.SC_OK)
        .body("$.size()", is(2));

    verify(userServiceMock, times(1)).getAll();
  }

  @Test
  void testGetAllWithoutAdminRole() {
    String token = AuthenticationHelper.getToken("luke", "test");

    User mockUser = new User();
    mockUser.setUserName("luke");
    mockUser.setAllRoles(List.of(RoleName.TECSWAP));
    when(userServiceMock.get("luke")).thenReturn(mockUser);

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/user")
        .then()
        .statusCode(HttpStatus.SC_FORBIDDEN);

    verify(userServiceMock, never()).getAll();
  }

  @Test
  void testPutUserSettings() {
    String token = AuthenticationHelper.getToken("luke", "test");

    User mockUser = new User();
    mockUser.setUserName("luke");
    mockUser.updateUserDisplay(false, false);
    when(userServiceMock.get("luke")).thenReturn(mockUser);

    UserSettingsDto settingsDto = new UserSettingsDto();
    settingsDto.setShowIconsInColor(true);
    settingsDto.setShowIcons(true);

    when(userServiceMock.updateUserSettings(any(User.class), any(UserSettingsDto.class)))
        .thenReturn(settingsDto);

    Response response =
        given()
            .when()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(settingsDto)
            .put("/user/settings")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();

    // Verify that userServiceMock.updateUserSettings was called with correct parameters
    ArgumentCaptor<User> capturedUserObject = ArgumentCaptor.forClass(User.class);
    ArgumentCaptor<UserSettingsDto> capturedSettingsDto =
        ArgumentCaptor.forClass(UserSettingsDto.class);
    verify(userServiceMock, times(1))
        .updateUserSettings(capturedUserObject.capture(), capturedSettingsDto.capture());

    assertEquals("luke", capturedUserObject.getValue().getUserName());
    assertEquals(true, capturedSettingsDto.getValue().getShowIconsInColor());
    assertEquals(true, capturedSettingsDto.getValue().getShowIcons());

    // Verify HTTP response contains correct body
    JsonPath json = new JsonPath(response.asString());
    assertTrue(json.getBoolean("showIconsInColor"));
    assertTrue(json.getBoolean("showIcons"));
    assertEquals(
        capturedSettingsDto.getValue().getShowIconsInColor(), json.getBoolean("showIconsInColor"));
    assertEquals(capturedSettingsDto.getValue().getShowIcons(), json.getBoolean("showIcons"));
  }

  @Test
  void testPutUserSettingsUnauthorized() {
    UserSettingsDto settingsDto = new UserSettingsDto();
    settingsDto.setShowIconsInColor(true);

    given()
        .when()
        .contentType(ContentType.JSON)
        .body(settingsDto)
        .put("/user/settings")
        .then()
        .statusCode(HttpStatus.SC_UNAUTHORIZED);
  }
}

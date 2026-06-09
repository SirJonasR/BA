package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.AuthenticationHelper;
import com.eviden.tecradar.entity.FeatureFlag;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.service.FeatureFlagService;
import com.eviden.tecradar.service.UserService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import java.util.List;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class FeatureFlagResourceTest {

  @InjectMock FeatureFlagService featureFlagService;
  @InjectMock UserService userService;

  private User testUser;
  private User testAdmin;
  private List<FeatureFlag> mockFlags;

  @BeforeEach
  void setUp() {
    testUser = new User();
    testUser.setId(1L);
    testUser.setUserName("leia");
    testUser.addRole(RoleName.USER);

    testAdmin = new User();
    testAdmin.setId(2L);
    testAdmin.setUserName("luke");
    testAdmin.addRole(RoleName.ADMIN);

    FeatureFlag flag1 = new FeatureFlag();
    flag1.setEnabled(false);
    flag1.setName("flag1");

    FeatureFlag flag2 = new FeatureFlag();
    flag2.setEnabled(true);
    flag2.setName("flag2");

    mockFlags = List.of(flag1, flag2);

    when(userService.findOrCreate("leia")).thenReturn(testUser);
    when(userService.findOrCreate("luke")).thenReturn(testAdmin);
  }

  @Test
  public void testGetAllFeatureFlags() {
    String userToken = AuthenticationHelper.getToken("luke", "test");
    when(featureFlagService.getAllFeatureFlags()).thenReturn(mockFlags);

    given()
        .when()
        .header("Authorization", "Bearer " + userToken)
        .get("/feature-flags")
        .then()
        .statusCode(200)
        .body("size()", is(2))
        .body("[0].name", is("flag1"))
        .body("[0].enabled", is(false))
        .body("[1].name", is("flag2"))
        .body("[1].enabled", is(true));
  }

  @Test
  public void testGetAllFeatureFlagsWithoutAuthorization() {
    given().when().get("/feature-flags").then().statusCode(HttpStatus.SC_UNAUTHORIZED);
  }

  @Test
  void testPutFlagWithoutAuthentication() {
    given()
        .contentType("application/json")
        .body("{\"enabled\": true}")
        .when()
        .put("/feature-flags/some-flag")
        .then()
        .statusCode(HttpStatus.SC_UNAUTHORIZED);
  }

  @Test
  void testPutFlagWithoutAdminRole() {
    String userToken = AuthenticationHelper.getToken("leia", "test");
    given()
        .header("Authorization", "Bearer " + userToken)
        .contentType("application/json")
        .body("{\"enabled\": true}")
        .when()
        .put("/feature-flags/some-flag")
        .then()
        .statusCode(HttpStatus.SC_FORBIDDEN);
  }

  @Test
  void testPutFlagWithAdminRole() {
    String userToken = AuthenticationHelper.getToken("luke", "test");
    given()
        .header("Authorization", "Bearer " + userToken)
        .contentType("application/json")
        .body("{\"enabled\": true}")
        .when()
        .put("/feature-flags/some-flag")
        .then()
        .statusCode(HttpStatus.SC_OK);
  }
}

package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.AuthenticationHelper;
import com.eviden.tecradar.entity.RoleName;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.model.CommentDto;
import com.eviden.tecradar.service.CommentService;
import com.eviden.tecradar.service.UserService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

/** Tests for comment endpoint. */
@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CommentResourceTest {

  @InjectMock CommentService commentService;
  @InjectMock UserService userService;

  private User testUser;
  private List<CommentDto> mockComments;

  @BeforeEach
  void setUp() {
    testUser = new User();
    testUser.setId(1L);
    testUser.setUserName("leia");
    testUser.addRole(RoleName.TECSWAP); // Add the required TECSWAP role

    CommentDto comment1 = new CommentDto();
    comment1.setText("Test comment 1");
    comment1.setAuthorUsername("leia");
    comment1.setDate(LocalDateTime.now());

    CommentDto comment2 = new CommentDto();
    comment2.setText("Test comment 2");
    comment2.setAuthorUsername("leia");
    comment2.setDate(LocalDateTime.now());

    mockComments = Arrays.asList(comment1, comment2);

    // Mock UserService to return test user
    when(userService.findOrCreate("leia")).thenReturn(testUser);
  }

  /** Test for getting comments for a specific TecSwapElement. */
  @Test
  @Order(1)
  void testGetCommentsEndpoint() {
    String token = AuthenticationHelper.getToken("leia", "test");

    // Mock CommentService to return test comments
    when(commentService.getComments(eq(1L), any(User.class))).thenReturn(mockComments);

    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .when()
            .get("/comments/1")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();

    JsonPath json = new JsonPath(response.asString());

    // Verify the response contains the expected comments
    Assertions.assertEquals(2, json.getList("$").size());
    Assertions.assertEquals("Test comment 1", json.getString("[0].text"));
    Assertions.assertEquals("Test comment 2", json.getString("[1].text"));
  }

  /** Test for getting comments for a non-existent TecSwapElement. */
  @Test
  @Order(2)
  void testGetCommentsForNonExistentElement() {
    String token = AuthenticationHelper.getToken("leia", "test");

    // Mock CommentService to throw ResourceNotFoundException
    when(commentService.getComments(eq(999L), any(User.class)))
        .thenThrow(new ResourceNotFoundException("TecSwapElement not found"));

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/comments/999")
        .then()
        .statusCode(HttpStatus.SC_NOT_FOUND);
  }

  /** Test for getting comments without authentication. */
  @Test
  @Order(3)
  void testGetCommentsWithoutAuth() {
    given().when().get("/comments/1").then().statusCode(HttpStatus.SC_UNAUTHORIZED);
  }

  /** Test for getting comments without TECSWAP role. */
  @Test
  @Order(4)
  void testGetCommentsWithoutTecSwapRole() {
    // Create a user without TECSWAP role
    User userWithoutRole = new User();
    userWithoutRole.setId(2L);
    userWithoutRole.setUserName("luke");
    // Don't add TECSWAP role - user will only have default USER role

    when(userService.findOrCreate("luke")).thenReturn(userWithoutRole);

    String token = AuthenticationHelper.getToken("luke", "test");

    given()
        .header("Authorization", "Bearer " + token)
        .when()
        .get("/comments/1")
        .then()
        .statusCode(HttpStatus.SC_FORBIDDEN);
  }

  /** Test for posting a comment for a specific TecSwapElement. */
  @Test
  @Order(5)
  void testPostCommentEndpoint() {
    String token = AuthenticationHelper.getToken("leia", "test");

    // Mock CommentService to do nothing on successful post
    doNothing()
        .when(commentService)
        .postComment(eq(1L), any(CommentPostRequest.class), any(User.class));

    String commentJson =
        """
        {
          "content": "This is a test comment",
          "didTechnologyChange": true,
          "didTecSwapElementChange": false
        }
        """;

    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(commentJson)
        .when()
        .post("/comments/1")
        .then()
        .statusCode(HttpStatus.SC_OK);
  }

  /** Test for posting a comment with minimal data. */
  @Test
  @Order(6)
  void testPostCommentWithMinimalData() {
    String token = AuthenticationHelper.getToken("leia", "test");

    doNothing()
        .when(commentService)
        .postComment(eq(1L), any(CommentPostRequest.class), any(User.class));

    String commentJson =
        """
        {
          "content": "Minimal comment",
          "didTechnologyChange": false,
          "didTecSwapElementChange": false
        }
        """;

    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(commentJson)
        .when()
        .post("/comments/1")
        .then()
        .statusCode(HttpStatus.SC_OK);
  }

  /** Test for posting a comment for a non-existent TecSwapElement. */
  @Test
  @Order(7)
  void testPostCommentForNonExistentElement() {
    String token = AuthenticationHelper.getToken("leia", "test");

    // Mock CommentService to throw ResourceNotFoundException
    doThrow(new ResourceNotFoundException("TecSwapElement not found"))
        .when(commentService)
        .postComment(eq(999L), any(CommentPostRequest.class), any(User.class));

    String commentJson =
        """
        {
          "content": "Comment for non-existent element",
          "didTechnologyChange": false,
          "didTecSwapElementChange": false
        }
        """;

    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(commentJson)
        .when()
        .post("/comments/999")
        .then()
        .statusCode(HttpStatus.SC_NOT_FOUND);
  }

  /** Test for posting a comment without authentication. */
  @Test
  @Order(8)
  void testPostCommentWithoutAuth() {
    String commentJson =
        """
        {
          "content": "Unauthorized comment",
          "didTechnologyChange": false,
          "didTecSwapElementChange": false
        }
        """;

    given()
        .contentType(ContentType.JSON)
        .body(commentJson)
        .when()
        .post("/comments/1")
        .then()
        .statusCode(HttpStatus.SC_UNAUTHORIZED);
  }

  /** Test for posting a comment without TECSWAP role. */
  @Test
  @Order(9)
  void testPostCommentWithoutTecSwapRole() {
    // Create a user without TECSWAP role
    User userWithoutRole = new User();
    userWithoutRole.setId(3L);
    userWithoutRole.setUserName("luke");
    // Don't add TECSWAP role - user will only have default USER role

    when(userService.findOrCreate("luke")).thenReturn(userWithoutRole);

    String token = AuthenticationHelper.getToken("luke", "test");

    String commentJson =
        """
        {
          "content": "Comment from user without TECSWAP role",
          "didTechnologyChange": false,
          "didTecSwapElementChange": false
        }
        """;

    given()
        .header("Authorization", "Bearer " + token)
        .contentType(ContentType.JSON)
        .body(commentJson)
        .when()
        .post("/comments/1")
        .then()
        .statusCode(HttpStatus.SC_FORBIDDEN);
  }
}

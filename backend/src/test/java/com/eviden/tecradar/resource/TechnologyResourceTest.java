package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import com.eviden.tecradar.AuthenticationHelper;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

/** tests for technology endpoint. */
@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TechnologyResourceTest {

  /** test for getting all technology endpoints. */
  @Test
  @Order(1)
  void testGetAllTechnologiesEndpoint() {
    Response response =
        given().when().get("/technology").then().statusCode(HttpStatus.SC_OK).extract().response();

    JsonPath json = new JsonPath(response.asString());

    Assertions.assertEquals("Quarkus", json.getString("[4].name"));
    Assertions.assertEquals("IntelliJ", json.getString("[2].name"));
    Assertions.assertEquals("AWS", json.getString("[1].name"));
    Assertions.assertEquals("TypeScript", json.getString("[6].name"));
    Assertions.assertEquals("Java", json.getString("[3].name"));
    Assertions.assertEquals("VSCode", json.getString("[7].name"));
    Assertions.assertEquals("Agile", json.getString("[0].name"));
    Assertions.assertEquals("Scrum", json.getString("[5].name"));

    Assertions.assertEquals("-4", json.getString("[0].categoryId"));
    Assertions.assertEquals("-3", json.getString("[1].categoryId"));
    Assertions.assertEquals("-2", json.getString("[2].categoryId"));
    Assertions.assertEquals("-1", json.getString("[3].categoryId"));
    Assertions.assertEquals("-1", json.getString("[4].categoryId"));
    Assertions.assertEquals("-4", json.getString("[5].categoryId"));
    Assertions.assertEquals("-1", json.getString("[6].categoryId"));
    Assertions.assertEquals("-2", json.getString("[7].categoryId"));

    Assertions.assertEquals("-3", json.getString("[0].lifecycleId"));
    Assertions.assertEquals("-3", json.getString("[1].lifecycleId"));
    Assertions.assertEquals("-2", json.getString("[2].lifecycleId"));
    Assertions.assertEquals("-3", json.getString("[3].lifecycleId"));
    Assertions.assertEquals("-1", json.getString("[4].lifecycleId"));
    Assertions.assertEquals("-4", json.getString("[5].lifecycleId"));
    Assertions.assertEquals("-3", json.getString("[6].lifecycleId"));
    Assertions.assertEquals("-3", json.getString("[7].lifecycleId"));
  }

  /** test getting single technology endpoint. */
  @Test
  @Order(2)
  void testGetSingleTechnologyEndpoint() {
    Response response =
        given()
            .when()
            .get("/technology/-1")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();

    JsonPath json = new JsonPath(response.asString());

    Assertions.assertEquals(-1, json.getInt("id"));
    Assertions.assertEquals("Quarkus", json.getString("name"));
    Assertions.assertEquals("Lorem ipsum dolor amet.", json.getString("description"));
    Assertions.assertEquals(-1, json.getInt("categoryId"));
    Assertions.assertEquals(-1, json.getInt("lifecycleId"));

    given().when().get("/technology/-500").then().statusCode(404);
  }

  /** test post new technology endpoint. */
  @Test
  @Order(3)
  void testPostTechnologyEndpoint() {
    String token = AuthenticationHelper.getToken("leia", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.MULTIPART)
            .multiPart("name", "React")
            .multiPart("description", "Lorem ipsum dolor amet.")
            .multiPart("shortDescription", "A short Description for React")
            .multiPart("categoryId", "-1")
            .multiPart("lifecycleId", "-4")
            .multiPart("tags", "Tag1")
            .multiPart("isNewPic", "true")
            .multiPart("pictureData", "AAAAA")
            .when()
            .post("/technology")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();

    JsonPath json = new JsonPath(response.asString());
    Assertions.assertNotNull(json.getString("id"));
    Assertions.assertEquals("React", json.getString("name"));
    Assertions.assertEquals("Lorem ipsum dolor amet.", json.getString("description"));
    Assertions.assertEquals("A short Description for React", json.getString("shortDescription"));
    Assertions.assertEquals(-1, json.getInt("categoryId"));
    Assertions.assertEquals(-4, json.getInt("lifecycleId"));
    Assertions.assertEquals("[Tag1]", json.getString("tags"));
    Assertions.assertNotNull(json.getString("pictureId"));
  }

  /** test post invalid technology endpoint. */
  @Test
  @Order(4)
  void testPostInvalidTechnologyEndpoint() {
    String token = AuthenticationHelper.getToken("leia", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.MULTIPART)
            .multiPart("name", "ReactTest")
            .multiPart("categoryId", "-9")
            .when()
            .post("/technology")
            .then()
            .statusCode(HttpStatus.SC_NOT_FOUND)
            .extract()
            .response();
  }

  /** test post already existing technology name. */
  @Test
  @Order(5)
  void testPostAlreadyExistingTechnologyName() {
    String token = AuthenticationHelper.getToken("leia", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.MULTIPART)
            .multiPart("name", "Java")
            .multiPart("description", "Lorem ipsum dolor amet.")
            .multiPart("isNewPic", "false")
            .multiPart("categoryId", "-1")
            .multiPart("lifecycleId", "-4")
            .when()
            .post("/technology")
            .then()
            .statusCode(HttpStatus.SC_CONFLICT)
            .extract()
            .response();
    Assertions.assertEquals("Technology already exists", response.asString());
  }

  /** test put technology endpoint. */
  @Test
  @Order(6)
  void testPutTechnologyEndpoint() {
    String token = AuthenticationHelper.getToken("yoda", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.MULTIPART)
            .multiPart("name", "Angular")
            .multiPart("description", "To be or not to be?")
            .multiPart("shortDescription", "New short description")
            .multiPart("isNewPic", "false")
            .multiPart("categoryId", "-1")
            .multiPart("lifecycleId", "-2")
            .multiPart("tags", "Tag2")
            .multiPart("isNewPic", "false")
            .multiPart("pictureData", "")
            .when()
            .put("/technology/-7")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();

    JsonPath json = new JsonPath(response.asString());

    Assertions.assertEquals(-7, json.getInt("id"));
    Assertions.assertEquals("Angular", json.getString("name"));
    Assertions.assertEquals("To be or not to be?", json.getString("description"));
    Assertions.assertEquals(-1, json.getInt("categoryId"));
    Assertions.assertEquals(-2, json.getInt("lifecycleId"));
    Assertions.assertEquals("[Tag2]", json.getString("tags"));
    Assertions.assertNull(json.getString("pictureId"));
  }

  /** test put technology with nonexistent technology. */
  @Test
  @Order(7)
  void testPutTechnologyEndpointWithNonExistentTechnology() {
    String token = AuthenticationHelper.getToken("leia", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.MULTIPART)
            .multiPart("name", "Angular")
            .multiPart("description", "To be or not to be?")
            .multiPart("isNewPic", "false")
            .multiPart("categoryId", "-1")
            .multiPart("lifecycleId", "-2")
            .multiPart("isNewPic", "false")
            .multiPart("pictureData", "")
            .when()
            .put("/technology/-70")
            .then()
            .statusCode(HttpStatus.SC_NOT_FOUND)
            .extract()
            .response();
  }

  /** test deleting technology with nonexistent id endpoint. */
  @Test
  @Order(8)
  void testDeleteTechnologyEndpointWithNotExistingId() {
    String adminToken = AuthenticationHelper.getToken("luke", "test");

    given()
        .when()
        .header("Authorization", "Bearer " + adminToken)
        .delete("/technology/-404")
        .then()
        .statusCode(HttpStatus.SC_NOT_FOUND)
        .extract()
        .response();
  }

  /** test for deleting technology with no admin permission endpoint.. */
  @Test
  @Order(9)
  void testDeleteTechnologyEndpointWithNoAdminUser() {
    String noAdminToken = AuthenticationHelper.getToken("leia", "test");

    given()
        .when()
        .header("Authorization", "Bearer " + noAdminToken)
        .delete("/technology/-4")
        .then()
        .statusCode(HttpStatus.SC_FORBIDDEN);
  }

  /** test for deleting technology as admin endpoint. */
  @Test
  @Order(11)
  void testDeleteTechnologyEndpointWithAdminUser() {
    String adminToken = AuthenticationHelper.getToken("luke", "test");

    given()
        .when()
        .header("Authorization", "Bearer " + adminToken)
        .delete("/technology/-4")
        .then()
        .statusCode(HttpStatus.SC_NO_CONTENT);
  }

  /** test for increment visit counter for existent technology */
  @Test
  @Order(10)
  void testIncrementTechnologyEndpoint() {
    String adminToken = AuthenticationHelper.getToken("luke", "test");

    given()
        .when()
        .header("Authorization", "Bearer " + adminToken)
        .get("/technology/count/-4")
        .then()
        .statusCode(HttpStatus.SC_OK);
  }

  /** test for increment visit counter for non-existent technology */
  @Test
  @Order(12)
  void testIncrementTechnologyEndpointWithNonExistentId() {
    String adminToken = AuthenticationHelper.getToken("luke", "test");

    given()
        .when()
        .header("Authorization", "Bearer " + adminToken)
        .get("/technology/count/-10")
        .then()
        .statusCode(HttpStatus.SC_NOT_FOUND);
  }
}

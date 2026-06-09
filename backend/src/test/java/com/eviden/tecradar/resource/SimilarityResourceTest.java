package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** test for similarity endpoints */
@QuarkusTest
class SimilarityResourceTest {
  /**
   * test for getting similarity endpoints. (Technology with the id -2 has the same tags as
   * Technology with the id -3)
   */
  @Test
  void testGetTagSimilarity() {
    Response response =
        given()
            .when()
            .get("/similarity/-2")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();
    Assertions.assertTrue(response.asString().contains("-3"));
  }
  /** test getting similarity with nonexistent technology endpoint. */
  @Test
  void testGetTagSimilarityForNonExistentTechnology() {
    Response response =
        given()
            .when()
            .get("/similarity/-100")
            .then()
            .statusCode(HttpStatus.SC_NOT_FOUND)
            .extract()
            .response();
  }
}

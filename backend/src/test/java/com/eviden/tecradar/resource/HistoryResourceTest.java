package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for history endpoint. */
@QuarkusTest
class HistoryResourceTest {
  /** test getting history with given technology id endpoint. */
  @Test
  void testGetSingleHistoryEndpoint() {
    Response response =
        given().when().get("/history/-1").then().statusCode(200).extract().response();

    JsonPath json = new JsonPath(response.asString());

    Assertions.assertEquals(-1, json.getInt("[0].id"));
    Assertions.assertEquals("Quarkus", json.getString("[0].name"));
    Assertions.assertEquals("Lorem ipsum dolor amet.", json.getString("[0].description"));
    Assertions.assertEquals("2022-10-06T07:20:35.765", json.getString("[0].date"));
    Assertions.assertEquals("luke", json.getString("[0].username"));
    Assertions.assertEquals("Monitor", json.getString("[0].lifecycleName"));
    Assertions.assertEquals("Languages & Frameworks", json.getString("[0].categoryName"));
  }
  /** test for getting nonexistent history endpoint. */
  @Test
  void testGetNonExistentHistory() {
    given().when().get("/history/-500").then().statusCode(404);
  }
}

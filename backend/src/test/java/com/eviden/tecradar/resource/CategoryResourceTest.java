package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for category endpoints. */
@QuarkusTest
class CategoryResourceTest {
  /** test getting all categories' endpoint. */
  @Test
  void testGetAllCategoriesEndpoint() {
    Response response = given().when().get("/category").then().statusCode(200).extract().response();

    JsonPath json = new JsonPath(response.asString());

    Assertions.assertEquals("-4", json.getString("[0].id"));
    Assertions.assertEquals("-3", json.getString("[1].id"));
    Assertions.assertEquals("-2", json.getString("[2].id"));
    Assertions.assertEquals("-1", json.getString("[3].id"));

    Assertions.assertEquals("Languages & Frameworks", json.getString("[3].name"));
    Assertions.assertEquals("Tools", json.getString("[2].name"));
    Assertions.assertEquals("Platforms", json.getString("[1].name"));
    Assertions.assertEquals("Techniques & Methodologies", json.getString("[0].name"));
  }
}

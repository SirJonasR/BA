package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/** tests for lifecycle endpoints. */
@QuarkusTest
class LifecycleResourceTest {
  /** test getting all lifecycles endpoints */
  @Test
  void testGetAllLifecycleEndpoint() {
    Response response =
        given().when().get("/lifecycle").then().statusCode(200).extract().response();

    JsonPath json = new JsonPath(response.asString());

    Assertions.assertEquals("-4", json.getString("[0].id"));
    Assertions.assertEquals("-3", json.getString("[1].id"));
    Assertions.assertEquals("-2", json.getString("[2].id"));
    Assertions.assertEquals("-1", json.getString("[3].id"));

    Assertions.assertEquals("Maintain", json.getString("[0].name"));
    Assertions.assertEquals("Adopt", json.getString("[1].name"));
    Assertions.assertEquals("Assess", json.getString("[2].name"));
    Assertions.assertEquals("Monitor", json.getString("[3].name"));
  }
}

package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import com.eviden.tecradar.service.TagService;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import jakarta.inject.Inject;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** tests for tag resource. */
@QuarkusTest
class TagResourceTest {
  @Inject TagService tagService;

  @BeforeEach
  void setup() {
    tagService.getOrCreate("Tag1");
    tagService.getOrCreate("Tag2");
  }
  /** tests for getting all tags endpoint. */
  @Test
  void testGetAll() {
    Response response =
        given().when().get("/tag").then().statusCode(HttpStatus.SC_OK).extract().response();
    JsonPath json = new JsonPath(response.asString());
    Assertions.assertEquals("Tag1", json.getString("[0]"));
    Assertions.assertEquals("Tag2", json.getString("[1]"));
  }
}

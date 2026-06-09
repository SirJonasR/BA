package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import com.eviden.tecradar.entity.Picture;
import com.eviden.tecradar.service.PictureService;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import jakarta.inject.Inject;
import java.util.Base64;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;

/** tests for picture resources. */
@QuarkusTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class PictureResourceTest {

  @Inject PictureService pictureService;
  Long id;

  @BeforeEach
  void setUp() {
    byte[] sampleData = Base64.getDecoder().decode("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    Picture picture = pictureService.create(sampleData);
    id = picture.getId();
  }

  /** test getting existing picture endpoint. */
  @Test
  @Order(1)
  void testGetExistingPic() {
    Response response =
        given().when().get("/picture/1").then().statusCode(HttpStatus.SC_OK).extract().response();
    JsonPath json = new JsonPath(response.asString());
    Assertions.assertEquals("1", json.getString("id"));
  }
  /** test getting nonexistent picture endpoint. */
  @Test
  @Order(2)
  void testGetNonExistentPic() {
    given().get("/picture/-2").then().statusCode(HttpStatus.SC_NOT_FOUND).extract().response();
  }
  /** test getting all picture endpoint. */
  @Test
  @Order(2)
  void testGetAllPicturesEndpoint() {
    Response response =
        given().when().get("/picture").then().statusCode(HttpStatus.SC_OK).extract().response();
    JsonPath json = new JsonPath(response.asString());
    Assertions.assertEquals("1", json.getString("[0].id"));
    Assertions.assertEquals("2", json.getString("[1].id"));
  }
}

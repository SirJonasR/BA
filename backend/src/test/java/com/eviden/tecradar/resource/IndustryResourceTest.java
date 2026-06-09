package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.mockito.Mockito.when;

import com.eviden.tecradar.AuthenticationHelper;
import com.eviden.tecradar.entity.Industry;
import com.eviden.tecradar.entity.User;
import com.eviden.tecradar.service.IndustryService;
import com.eviden.tecradar.service.UserService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
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
class IndustryResourceTest {

  @InjectMock IndustryService industryService;
  @InjectMock UserService userService;

  private User testUser;
  private List<Industry> mockIndustries;

  @BeforeEach
  void setUp() {

    testUser = new User();
    testUser.setId(1L);
    testUser.setUserName("leia");

    Industry industry = new Industry();
    industry.setId(1L);
    industry.setName("Technology");
    Industry industry2 = new Industry();
    industry2.setId(2L);
    industry2.setName("Healthcare");

    mockIndustries = Arrays.asList(industry, industry2);

    when(userService.findOrCreate("leia")).thenReturn(testUser);
  }

  @Test
  @Order(1)
  void testGetIndustriesEndpoint() {
    String token = AuthenticationHelper.getToken("leia", "test");

    // Mock CommentService to return test comments
    when(industryService.getAll()).thenReturn(mockIndustries);

    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .when()
            .get("/industries")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();
    Assertions.assertEquals(200, response.statusCode());
    JsonPath json = new JsonPath(response.asString());

    Assertions.assertEquals(mockIndustries.size(), json.getList("$").size());
    Assertions.assertEquals(mockIndustries.get(0).getId().toString(), json.getString("[0].id"));
    Assertions.assertEquals(mockIndustries.get(0).getName(), json.getString("[0].name"));
    Assertions.assertEquals(mockIndustries.get(1).getName(), json.getString("[1].name"));
    Assertions.assertEquals(mockIndustries.get(1).getId().toString(), json.getString("[1].id"));
  }

  /** Test for getting comments without authentication. */
  @Test
  @Order(2)
  void testGetCommentsWithoutAuth() {
    given().when().get("/industries").then().statusCode(HttpStatus.SC_UNAUTHORIZED);
  }
}

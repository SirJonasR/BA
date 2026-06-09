package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

import com.eviden.tecradar.entity.Subscription;
import com.eviden.tecradar.exception.ResourceNotFoundException;
import com.eviden.tecradar.service.SubscriptionService;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.ws.rs.core.MediaType;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

@QuarkusTest
public class SubscriptionResourceTest {

  @InjectMock SubscriptionService subscriptionService;

  @Test
  public void testGetSubscriptionsByUser() {
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(1L);
    mockSubscription.setName("TestSubscription");
    mockSubscription.setTimespan(7);
    mockSubscription.setEmail("test@example.com");
    List<Subscription> mockSubscriptions = Arrays.asList(mockSubscription);

    Mockito.when(subscriptionService.getAllByUser("testUser")).thenReturn(mockSubscriptions);

    given()
        .pathParam("username", "testUser")
        .when()
        .get("/subscription/user/{username}")
        .then()
        .statusCode(200)
        .body("$.size()", is(mockSubscriptions.size()));
  }

  @Test
  public void testGetSubscriptionsByInvalidUser() {
    Mockito.when(subscriptionService.getAllByUser("invalidUser"))
        .thenThrow(new ResourceNotFoundException("No user found for name = invalidUser"));

    given()
        .pathParam("username", "invalidUser")
        .when()
        .get("/subscription/user/{username}")
        .then()
        .statusCode(404);
  }

  @Test
  public void testGetSubscriptionById() {
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(1L);
    mockSubscription.setName("TestSubscription");
    mockSubscription.setTimespan(7);
    mockSubscription.setEmail("test@example.com");

    Mockito.when(subscriptionService.get(1L)).thenReturn(mockSubscription);

    given()
        .pathParam("id", 1L)
        .when()
        .get("/subscription/id/{id}")
        .then()
        .statusCode(200)
        .body("id", is(1))
        .body("name", is("TestSubscription"))
        .body("timespan", is(7))
        .body("email", is("test@example.com"));
  }

  @Test
  public void testGetSubscriptionByInvalidId() {
    Mockito.when(subscriptionService.get(999L))
        .thenThrow(new ResourceNotFoundException("No subscription found with id = 999"));

    given()
        .pathParam("id", 999L)
        .when()
        .get("/subscription/id/{id}")
        .then()
        .statusCode(404); // Erwarteter Statuscode ist 404 Not Found
  }

  @Test
  public void testCreateSubscription() {
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(2L);
    mockSubscription.setName("TestSubscription");
    mockSubscription.setTimespan(7);
    mockSubscription.setEmail("test@example.com");

    Mockito.when(
            subscriptionService.create(
                Mockito.any(SubscriptionRequestForm.class), Mockito.anyString()))
        .thenReturn(mockSubscription);

    given()
        .contentType(MediaType.MULTIPART_FORM_DATA)
        .multiPart("dummyField", "dummyValue")
        .when()
        .post("/subscription")
        .then()
        .statusCode(200)
        .body("id", is(2))
        .body("name", is("TestSubscription"))
        .body("timespan", is(7))
        .body("email", is("test@example.com"));
  }

  @Test
  public void testCreateSubscriptionWithInvalidUser() {
    Mockito.when(
            subscriptionService.create(
                Mockito.any(SubscriptionRequestForm.class), Mockito.anyString()))
        .thenThrow(new ResourceNotFoundException("User not found"));

    given()
        .contentType("multipart/form-data")
        .multiPart("dummyField", "dummyValue")
        .when()
        .post("/subscription")
        .then()
        .statusCode(404);
  }

  @Test
  public void testUpdateSubscription() {
    Subscription mockSubscription = new Subscription();
    mockSubscription.setId(1L);
    mockSubscription.setName("TestSubscription");
    mockSubscription.setTimespan(7);
    mockSubscription.setEmail("test@example.com");

    Mockito.when(
            subscriptionService.update(
                Mockito.eq(1L), Mockito.any(SubscriptionRequestForm.class), Mockito.anyString()))
        .thenReturn(mockSubscription);

    given()
        .pathParam("id", 1L)
        .contentType(MediaType.MULTIPART_FORM_DATA)
        .multiPart("dummyField", "dummyValue")
        .when()
        .put("/subscription/{id}")
        .then()
        .statusCode(200)
        .body("id", is(1))
        .body("name", is("TestSubscription"))
        .body("timespan", is(7))
        .body("email", is("test@example.com"));
  }

  @Test
  public void testUpdateSubscriptionWithInvalidId() {
    Mockito.when(
            subscriptionService.update(
                Mockito.eq(999L), Mockito.any(SubscriptionRequestForm.class), Mockito.anyString()))
        .thenThrow(new ResourceNotFoundException("Subscription not found"));

    given()
        .pathParam("id", 999L)
        .contentType("multipart/form-data")
        .multiPart("dummyField", "dummyValue")
        .when()
        .put("/subscription/{id}")
        .then()
        .statusCode(404);
  }

  @Test
  public void testDeleteSubscription() {
    Mockito.doNothing().when(subscriptionService).delete(1L);

    given().pathParam("id", 1L).when().delete("/subscription/{id}").then().statusCode(204);
  }

  @Test
  public void testDeleteSubscriptionWithInvalidId() {
    Mockito.doThrow(new ResourceNotFoundException("No subscription found with id = 999"))
        .when(subscriptionService)
        .delete(999L);

    given().pathParam("id", 999L).when().delete("/subscription/{id}").then().statusCode(404);
  }
}

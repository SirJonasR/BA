package com.eviden.tecradar.resource;

import static io.restassured.RestAssured.given;

import com.eviden.tecradar.AuthenticationHelper;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;

@QuarkusTest
public class ContactFormResourceTest {
  @Test
  void testSendContactForm() {
    String token = AuthenticationHelper.getToken("luke", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.MULTIPART)
            .multiPart("description", "Test")
            .multiPart("mailAddress", "tecradar@atos.net")
            .multiPart("attachmentData", "null")
            .multiPart("attachmentFileName", "null")
            .multiPart("attachmentContentType", "null")
            .multiPart("mailType", "Feedback")
            .when()
            .post("/contact")
            .then()
            .statusCode(HttpStatus.SC_ACCEPTED)
            .extract()
            .response();
  }

  @Test
  void testGetSingleTechnologyEndpoint() {
    String token = AuthenticationHelper.getToken("luke", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .when()
            .get("/contact")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();
  }

  @Test
  void testDoesAgreementExistsEndpoint() {
    String token = AuthenticationHelper.getToken("luke", "test");
    Response response =
        given()
            .header("Authorization", "Bearer " + token)
            .when()
            .get("/contact/agreement")
            .then()
            .statusCode(HttpStatus.SC_OK)
            .extract()
            .response();
  }

  @Test
  void testRevokeConsentEndpoint() {
    String token = AuthenticationHelper.getToken("luke", "test");
    Response response =
        given()
            .header("Authorization", "Barer " + token)
            .queryParam("email", "testmail@test.com")
            .when()
            .delete("/contact/revoke-consent")
            .then()
            .statusCode(HttpStatus.SC_ACCEPTED)
            .extract()
            .response();
  }
}

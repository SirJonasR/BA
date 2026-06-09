package com.eviden.tecradar;

import static io.restassured.RestAssured.given;

import io.restassured.http.ContentType;
import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import org.eclipse.microprofile.config.ConfigProvider;

public class AuthenticationHelper {

  public static String getToken(String username, String password) {
    String clientId = ConfigProvider.getConfig().getValue("quarkus.oidc.client-id", String.class);
    String authServerUrl =
        ConfigProvider.getConfig().getValue("quarkus.oidc.auth-server-url", String.class);
    Response response =
        given()
            .contentType(ContentType.URLENC)
            .param("username", username)
            .param("password", password)
            .param("grant_type", "password")
            .param("client_id", clientId)
            .when()
            .post(authServerUrl + "/protocol/openid-connect/token")
            .then()
            .extract()
            .response();

    JsonPath json = new JsonPath(response.asString());

    return json.getString("access_token");
  }
}
